import apiClient from '@/lib/axios'

export const saveScore = async (gameName, score) => {
  const { data } = await apiClient.post(`/games/${gameName}/scores`, { score })
  return data.data
}

export const fetchTop10 = async (gameName) => {
  const { data } = await apiClient.get(`/games/${gameName}/scores/top10`)
  return data.data
}
