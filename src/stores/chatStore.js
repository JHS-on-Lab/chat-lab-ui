import { createRoom as createRoomApi, leaveRoom as leaveRoomApi  } from '@/api/chatApi'
import { getMyRooms, getRoomDetail } from '@/api/chatApi'
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
    const data = await getMyRooms()
    rooms.value = data

    if (rooms.value.length > 0) {
      selectedRoomId.value = rooms.value[0].id
      await loadRoomDetail(selectedRoomId.value)
    }
  }

  const selectRoom = async (roomId) => {
    if (selectedRoomId.value === roomId) return

    selectedRoomId.value = roomId

    if (!messages.value[roomId]) {
      await loadRoomDetail(roomId)
    }
  }

  const loadRoomDetail = async (roomId) => {
    const data = await getRoomDetail(roomId)

    messages.value[roomId] = data.messages
    members.value[roomId] = data.members
  }

  const addMessage = (roomId, message) => {
    if (!messages.value[roomId]) {
      messages.value[roomId] = []
    }

    messages.value[roomId].push(message)
  }

  const leaveRoom = async (roomId) => {
    try {
      await leaveRoomApi(roomId)

      rooms.value = rooms.value.filter(r => r.id !== roomId)

      delete messages.value[roomId]
      delete members.value[roomId]

      if (selectedRoomId.value === roomId) {
        selectedRoomId.value = rooms.value.length > 0 ? rooms.value[0].id : null
      }
    } catch (error) {
      throw error
    }
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
    selectedRoomId.value = newRoom.id
    messages.value[newRoom.id] = []
    members.value[newRoom.id] = []

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
    loadRoomDetail,
    addMessage,
    createRoom,
    leaveRoom,
    reset
  }
})