import {
  getMyRooms as getMyRoomsApi,
  createRoom as createRoomApi,
  leaveRoom as leaveRoomApi,
  inviteMember as inviteMemberApi,
  getRoomMembers as getRoomMembersApi,
  getRoomMessages as getRoomMessagesApi,
} from '@/api/chatApi'
import {
  connectSocket,
  disconnectSocket,
  subscribeRoom,
  unsubscribeRoom,
  sendChatMessage
} from '@/websocket/chatSocket'
import { decodeMessageList } from '@/lib/chatCodec'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // state
  const rooms = ref([])
  const selectedRoomId = ref(null)

  const messages = ref({})
  const members = ref({})

  const cursors = ref({})
  const hasNextMap = ref({})
  const loadingMap = ref({})

  const sendError = ref('')

  // getters
  const hasRooms = computed(() => rooms.value.length > 0)

  const currentMessages = computed(() =>
    selectedRoomId.value
      ? messages.value[selectedRoomId.value] || []
      : []
  )

  const currentMembers = computed(() =>
    selectedRoomId.value
      ? members.value[selectedRoomId.value] || []
      : []
  )

  // 같은 id 의 메시지가 중복으로 들어오지 않도록 병합 (구독과 히스토리 조회 사이 경합 대비)
  const mergeMessages = (base, incoming) => {
    const ids = new Set(base.map(m => m.id))
    return [...base, ...incoming.filter(m => !ids.has(m.id))].sort((a, b) => a.id - b.id)
  }

  const clearRoomCache = (roomId) => {
    delete messages.value[roomId]
    delete members.value[roomId]
    delete cursors.value[roomId]
    delete hasNextMap.value[roomId]
    delete loadingMap.value[roomId]
  }

  // actions
  const initialize = async () => {
    connectSocket()

    await reloadRooms()

    // 이전에 보던 방이 있으면 유지, 없으면 첫 번째 방 선택
    const target = selectedRoomId.value ?? rooms.value[0]?.id
    if (target) {
      await selectRoom(target, { force: true })
    }
  }

  const reloadRooms = async () => {
    rooms.value = await getMyRoomsApi()

    // 현재 선택된 방이 더 이상 목록에 없으면 선택 해제
    if (selectedRoomId.value && !rooms.value.some(r => r.id === selectedRoomId.value)) {
      unsubscribeRoom()
      clearRoomCache(selectedRoomId.value)
      selectedRoomId.value = null
    }
  }

  const selectRoom = async (roomId, { force = false } = {}) => {
    if (!force && selectedRoomId.value === roomId) return

    sendError.value = ''
    selectedRoomId.value = roomId

    // 구독하지 않던 동안의 메시지가 누락되지 않도록 캐시를 비우고 최신 페이지부터 다시 불러온다.
    // 구독을 먼저 걸어 두어 조회 중 도착한 메시지도 받는다 (중복은 mergeMessages 에서 제거).
    clearRoomCache(roomId)
    subscribeRoom(roomId)

    await Promise.all([
      loadRoomMessages(roomId),
      loadRoomMembers(roomId)
    ])
  }

  /**
   * 이전(더 오래된) 메시지 한 페이지를 불러온다.
   * @returns {boolean} 새로 불러온 메시지가 있는지 여부
   */
  const loadRoomMessages = async (roomId) => {
    if (loadingMap.value[roomId]) return false
    if (hasNextMap.value[roomId] === false) return false

    loadingMap.value[roomId] = true

    try {
      const res = await getRoomMessagesApi(roomId, cursors.value[roomId] ?? null)

      // 응답 대기 중 다른 방으로 이동했거나 방이 정리된 경우 결과를 버린다
      if (!loadingMap.value[roomId]) return false

      messages.value[roomId] = mergeMessages(messages.value[roomId] ?? [], decodeMessageList(res.messages))
      cursors.value[roomId] = res.nextCursor
      hasNextMap.value[roomId] = res.hasNext

      return res.messages.length > 0
    } finally {
      if (roomId in loadingMap.value) {
        loadingMap.value[roomId] = false
      }
    }
  }

  const loadRoomMembers = async (roomId) => {
    const data = await getRoomMembersApi(roomId)
    members.value[roomId] = data.map(m => m.username)
  }

  const addMessage = (roomId, message) => {
    messages.value[roomId] = mergeMessages(messages.value[roomId] ?? [], [message])
  }

  const leaveRoom = async (roomId) => {
    await leaveRoomApi(roomId)

    const wasSelected = selectedRoomId.value === roomId

    rooms.value = rooms.value.filter(r => r.id !== roomId)
    clearRoomCache(roomId)

    if (wasSelected) {
      unsubscribeRoom()
      selectedRoomId.value = null

      if (rooms.value.length > 0) {
        await selectRoom(rooms.value[0].id)
      }
    }
  }

  const inviteMember = async (roomId, username) => {
    await inviteMemberApi(roomId, username)
    await loadRoomMembers(roomId)
  }

  const createRoom = async (roomName) => {
    const newRoom = await createRoomApi({ name: roomName })
    rooms.value.unshift(newRoom)
    await selectRoom(newRoom.id)
    return newRoom
  }

  /**
   * @returns {boolean} 전송 요청 성공 여부
   */
  const sendMessage = (text) => {
    if (!selectedRoomId.value) return false

    sendError.value = ''

    const sent = sendChatMessage(selectedRoomId.value, {
      content: text,
      type: 'TEXT'
    })

    if (!sent) {
      sendError.value = '서버와 연결되어 있지 않습니다. 잠시 후 다시 시도해 주세요.'
    }

    return sent
  }

  const setSendError = (message) => {
    sendError.value = message
  }

  const reset = () => {
    disconnectSocket()

    rooms.value = []
    selectedRoomId.value = null
    messages.value = {}
    members.value = {}
    cursors.value = {}
    hasNextMap.value = {}
    loadingMap.value = {}
    sendError.value = ''
  }

  return {
    rooms,
    selectedRoomId,
    messages,
    members,
    sendError,
    hasRooms,
    currentMessages,
    currentMembers,
    initialize,
    selectRoom,
    reloadRooms,
    loadRoomMessages,
    loadRoomMembers,
    inviteMember,
    addMessage,
    createRoom,
    leaveRoom,
    sendMessage,
    setSendError,
    reset
  }
})
