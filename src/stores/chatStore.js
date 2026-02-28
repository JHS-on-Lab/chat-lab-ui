import {
  getMyRooms as getMyRoomsApi,
  createRoom as createRoomApi,
  leaveRoom as leaveRoomApi,
  inviteMember as inviteMemberApi,
  getRoomMembers as getRoomMembersApi,
  getRoomMessages as getRoomMessagesApi,
} from '@/api/chatApi'
import {
  connectChatSocket,
  disconnectChatSocket,
  sendChatMessage
} from '@/websocket/chatSocket'
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

  // actions
  const initialize = async () => {
    const data = await getMyRoomsApi()
    rooms.value = data

    if (rooms.value.length > 0) {
      await selectRoom(rooms.value[0].id)
    }
  }

  const selectRoom = async (roomId) => {
    if (selectedRoomId.value === roomId) return

    // 이전 소켓 종료
    disconnectChatSocket()

    selectedRoomId.value = roomId

    // 데이터 로딩
    await Promise.all([
      loadRoomMessages(roomId),
      loadRoomMembers(roomId)
    ])

    // 새 방 소켓 연결
    connectChatSocket(roomId)
  }

  const loadRoomMessages = async (roomId) => {
    if (loadingMap.value[roomId]) return
    if (hasNextMap.value[roomId] === false) return

    loadingMap.value[roomId] = true

    const cursor = cursors.value[roomId] || null
    const res = await getRoomMessagesApi(roomId, cursor)

    if (!messages.value[roomId]) {
      messages.value[roomId] = []
    }

    messages.value[roomId] = [
      ...res.messages,
      ...messages.value[roomId]
    ]

    cursors.value[roomId] = res.nextCursor
    hasNextMap.value[roomId] = res.hasNext
    loadingMap.value[roomId] = false
  }

  const loadRoomMembers = async (roomId) => {
    const data = await getRoomMembersApi(roomId)
    members.value[roomId] = data.map(m => m.username)
  }

  const addMessage = (roomId, message) => {
    if (!messages.value[roomId]) {
      messages.value[roomId] = []
    }
    messages.value[roomId].push(message)
  }

  const leaveRoom = async (roomId) => {
    await leaveRoomApi(roomId)

    // 현재 방이면 소켓 종료
    if (selectedRoomId.value === roomId) {
      disconnectChatSocket()
    }

    rooms.value = rooms.value.filter(r => r.id !== roomId)

    delete messages.value[roomId]
    delete members.value[roomId]
    delete cursors.value[roomId]
    delete hasNextMap.value[roomId]
    delete loadingMap.value[roomId]

    if (selectedRoomId.value === roomId) {
      selectedRoomId.value =
        rooms.value.length > 0 ? rooms.value[0].id : null

      if (selectedRoomId.value) {
        await selectRoom(selectedRoomId.value)
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

  const sendMessage = (text) => {
    if (!selectedRoomId.value) return
    sendChatMessage(selectedRoomId.value, {
      content: text,
      type: 'TEXT'
    })
  }

  const reset = () => {
    disconnectChatSocket()

    rooms.value = []
    selectedRoomId.value = null
    messages.value = {}
    members.value = {}
    cursors.value = {}
    hasNextMap.value = {}
    loadingMap.value = {}
  }

  return {
    rooms,
    selectedRoomId,
    messages,
    members,
    hasRooms,
    currentMessages,
    currentMembers,
    initialize,
    selectRoom,
    loadRoomMessages,
    loadRoomMembers,
    inviteMember,
    addMessage,
    createRoom,
    leaveRoom,
    sendMessage,
    reset
  }
})