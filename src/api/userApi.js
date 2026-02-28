import apiClient from '@/lib/axios'

export const getMyInfo = async () => {
  const { data } = await apiClient.get('users/me')
  return data.data
}
