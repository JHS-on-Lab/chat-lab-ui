import apiClient from '@/lib/axios'

export const getMyRooms = async () => {
  const { data } = await apiClient.get('/chat/rooms')
  return data.data
}

export const getRoomDetail = async (id) => {
  return null
}

export const createRoom = async (payload) => {
  const { data } = await apiClient.post('/chat/rooms', payload)
  return data.data
}

export const leaveRoom = async (roomId) => {
  await apiClient.delete(`/chat/rooms/${roomId}`)
}