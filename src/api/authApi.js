import apiClient from '@/lib/axios'

export const signin = async (payload) => {
  const { data } = await apiClient.post('auth/sign-in', payload)
  return data.data
}

export const signoutApi = async () => {
  await apiClient.post('auth/sign-out', null, { _skipAuthRefresh: true })
}
