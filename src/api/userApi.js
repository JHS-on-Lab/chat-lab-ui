import apiClient from '@/lib/axios'

export const getMyInfo = async () => {
  const { data } = await apiClient.get('users/me')
  return data.data
}

export const getUsers = async ({ page = 0, size = 20 } = {}) => {
  const { data } = await apiClient.get('/users', { params: { page, size } })
  return data.data
}

export const addUser = async ({ username, password, role }) => {
  const { data } = await apiClient.post('/users', {
    username,
    password,
    role
  })
  return data.data
}

// 관리자 전용: 다른 사용자 수정 (password 가 비어 있으면 유지)
export const modifyUserByAdmin = async (id, { username, password, role }) => {
  const { data } = await apiClient.put(`/users/${id}`, {
    username,
    password: password || null,
    role
  })
  return data.data
}

// 관리자 전용: 활성화 / 비활성화
export const changeUserStatus = async (id, enabled) => {
  const { data } = await apiClient.patch(`/users/${id}/status`, { enabled })
  return data.data
}

// 관리자 전용: 사용자와 관련된 모든 데이터 삭제
export const deleteUser = async (id) => {
  await apiClient.delete(`/users/${id}`)
}

export const modifyUser = async ({ currentPassword, username, password }) => {
  const { data } = await apiClient.put('/users', {
    currentPassword,
    username,
    password
  })
  return data.data
}