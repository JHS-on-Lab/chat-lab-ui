import {
  getFolders as getFoldersApi,
  createFolder as createFolderApi,
  getFiles as getFilesApi,
  createFile as createFileApi,
  downloadFolder as downloadFolderApi,
} from '@/api/fileApi'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFileStore = defineStore('file', () => {
  // state
  const folders = ref([])
  const filesByFolder = ref({})

  // getters
  const hasFolders = computed(() => folders.value.length > 0)

  // actions
  const loadFolders = async () => {
    folders.value = await getFoldersApi()
  }

  const createFolder = async (name) => {
    const folder = await createFolderApi({ name })
    folders.value.unshift(folder)
    return folder
  }

  const loadFiles = async (folderId) => {
    filesByFolder.value[folderId] = await getFilesApi(folderId)
  }

  const createFile = async (folderId, payload) => {
    const file = await createFileApi(folderId, payload)

    if (!filesByFolder.value[folderId]) {
      filesByFolder.value[folderId] = []
    }
    filesByFolder.value[folderId].push(file)

    return file
  }

  const downloadFolder = async (folderId) => {
    const folder = folders.value.find(f => f.id === Number(folderId))
    const blob = await downloadFolderApi(folderId)

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${folder?.name ?? 'folder'}.zip`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    folders.value = []
    filesByFolder.value = {}
  }

  return {
    folders,
    filesByFolder,
    hasFolders,
    loadFolders,
    createFolder,
    loadFiles,
    createFile,
    downloadFolder,
    reset
  }
})
