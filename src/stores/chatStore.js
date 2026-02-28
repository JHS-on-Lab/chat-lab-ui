import {
  getMyRooms as getMyRoomsApi,
  createRoom as createRoomApi,
  leaveRoom as leaveRoomApi,
  inviteMember as inviteMemberApi,
  getRoomMembers as getRoomMembersApi,
  getRoomMessages as getRoomMessagesApi,
  sendMessage as sendMessageApi,
} from '@/api/chatApi'
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
    selectedRoomId.value = roomId

    if (!messages.value[roomId]) {
      cursors.value[roomId] = null
      hasNextMap.value[roomId] = true
      await loadRoomMessages(roomId)
    }

    await loadRoomMembers(roomId)
  }

  const loadRoomMessages = async (roomId) => {
    if (loadingMap.value[roomId]) return
    if (hasNextMap.value[roomId] === false) return

    loadingMap.value[roomId] = true

    const cursor = cursors.value[roomId] || null
    console.log(roomId, cursor)
    const res = await getRoomMessagesApi(roomId, cursor)
    console.log(res)
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

    rooms.value = rooms.value.filter(r => r.id !== roomId)

    delete messages.value[roomId]
    delete members.value[roomId]
    delete cursors.value[roomId]
    delete hasNextMap.value[roomId]
    delete loadingMap.value[roomId]

    if (selectedRoomId.value === roomId) {
      selectedRoomId.value =
        rooms.value.length > 0 ? rooms.value[0].id : null
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

  const reset = () => {
    rooms.value = []
    selectedRoomId.value = null
    messages.value = {}
    members.value = {}
    cursors.value = {}
    hasNextMap.value = {}
    loadingMap.value = {}
  }

  const sendMessage = async (content) => {
    if (!selectedRoomId.value) return
    if (!content.trim()) return

    const message = await sendMessageApi(selectedRoomId.value, {
      type: 'TEXT',
      content
    })

    if (!messages.value[selectedRoomId.value]) {
      messages.value[selectedRoomId.value] = []
    }

    messages.value[selectedRoomId.value].push(message)
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