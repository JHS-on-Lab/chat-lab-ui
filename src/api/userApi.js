import apiClient from '@/lib/axios'

export const signup = (payload) => {
  return apiClient.post('users', payload)
}

export const getUsers = (payload) => {
  return apiClient.get('users', { params: payload })
}

export const getMyInfo = () => {
  return apiClient.get('users/me')
}

export const getSocialLinkUrl = (provider) => {
  return apiClient.get('auth/oauth2/link/' + provider)
}
