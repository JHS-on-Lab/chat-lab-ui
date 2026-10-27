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

export const modifyUser = async ({ currentPassword, username, password }) => {
  const { data } = await apiClient.put('/users', {
    currentPassword,
    username,
    password
  })
  return data.data
}