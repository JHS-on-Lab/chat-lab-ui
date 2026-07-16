import apiClient from '@/lib/axios'

export const getFolders = async () => {
  const { data } = await apiClient.get('/folders')
  return data.data
}

export const createFolder = async (payload) => {
  const { data } = await apiClient.post('/folders', payload)
  return data.data
}

export const getFiles = async (folderId) => {
  const { data } = await apiClient.get(`/folders/${folderId}/files`)
  return data.data
}

export const createFile = async (folderId, payload) => {
  const { data } = await apiClient.post(`/folders/${folderId}/files`, payload)
  return data.data
}

export const deleteFolder = async (folderId) => {
  await apiClient.delete(`/folders/${folderId}`)
}

export const downloadFolder = async (folderId) => {
  const response = await apiClient.get(`/folders/${folderId}/download`, {
    responseType: 'blob'
  })
  return response.data
}
