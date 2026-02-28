import apiClient from '@/lib/axios'

export const getMyInfo = async () => {
  const { data } = await apiClient.get('users/me')
  return data.data
}

export const addUser = async ({ username, password }) => {
  const { data } = await apiClient.post('/users', {
    username,
    password
  })
  return data.data
}

export const modifyUser = async ({ username, password }) => {
  const { data } = await apiClient.put('/users', {
    username,
    password
  })
  return data.data
}