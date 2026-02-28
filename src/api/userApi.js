import apiClient from '@/lib/axios'

export const signup = (payload) => {
  return apiClient.post('users', payload)
}

export const getMyInfo = () => {
  return apiClient.get('users/me')
}
