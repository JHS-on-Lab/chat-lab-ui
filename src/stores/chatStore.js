import {
  getMyRooms as getMyRoomsApi,
  getRoomDetail as getRoomDetailApi,
  createRoom as createRoomApi,
  leaveRoom as leaveRoomApi,
  inviteMember as inviteMemberApi,
  getRoomMembers as getRoomMembersApi,
} from '@/api/chatApi'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // state
  const rooms = ref([])
  const selectedRoomId = ref(null)
  const messages = ref({})
  const members = ref({})

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

    await Promise.all([
      // loadRoomMessages(roomId),
      loadRoomMembers(roomId)
    ])
  }

  const loadRoomMessages = async (roomId) => {
    const data = await getRoomMessagesApi(roomId)
    messages.value[roomId] = data
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

    if (selectedRoomId.value === roomId) {
      selectedRoomId.value = rooms.value.length > 0 ? rooms.value[0].id : null
    }
  }

  const inviteMember = async (roomId, username) => {
    await inviteMemberApi(roomId, username)
    await loadRoomMembers(roomId)
  }

  const reset = () => {
    rooms.value = []
    selectedRoomId.value = null
    messages.value = {}
    members.value = {}
  }

  const createRoom = async (roomName) => {
    const newRoom = await createRoomApi({ name: roomName })
    rooms.value.unshift(newRoom)
    await selectRoom(newRoom.id)
    return newRoom
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
    inviteMember,
    loadRoomMembers,
    addMessage,
    createRoom,
    leaveRoom,
    reset
  }
})