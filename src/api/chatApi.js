import apiClient from '@/lib/axios'

export const getMyRooms = async () => {
  const { data } = await apiClient.get('/chat/rooms')
  return data.data
}

export const getRoomDetail = async () => {
  return null
}

export const createRoom = async (payload) => {
  const { data } = await apiClient.post('/chat/rooms', payload)
  return data.data
}

export const leaveRoom = async (roomId) => {
  await apiClient.delete(`/chat/rooms/${roomId}`)
}

export const inviteMember = async (roomId, username) => {
  await apiClient.post(`/chat/rooms/${roomId}/members`, {
    username
  })
}

export const getRoomMembers = async (roomId) => {
  const { data } = await apiClient.get(`/chat/rooms/${roomId}/members`)
  return data.data
}