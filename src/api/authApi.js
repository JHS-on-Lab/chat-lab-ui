import apiClient from '@/lib/axios'

export const signin = async (payload) => {
  const response = await apiClient.post('auth/sign-in', payload)
  return response.data.data
}
