import {
  getFolders as getFoldersApi,
  createFolder as createFolderApi,
  getFiles as getFilesApi,
  createFile as createFileApi,
  deleteFolder as deleteFolderApi,
} from '@/api/fileApi'
import { encodeFile, decodeFile, decodeFileList } from '@/lib/fileCodec'
import JSZip from 'jszip'
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
    const files = await getFilesApi(folderId)
    filesByFolder.value[folderId] = decodeFileList(files)
  }

  const createFile = async (folderId, payload) => {
    const created = await createFileApi(folderId, encodeFile(payload))
    const file = decodeFile(created)

    if (!filesByFolder.value[folderId]) {
      filesByFolder.value[folderId] = []
    }
    filesByFolder.value[folderId].push(file)

    return file
  }

  const deleteFolder = async (folderId) => {
    await deleteFolderApi(folderId)
    folders.value = folders.value.filter(f => f.id !== Number(folderId))
    delete filesByFolder.value[folderId]
  }

  const resolveUniqueEntryName = (file, nameCounts) => {
    const baseName = `${file.title}.${file.extension}`
    const count = (nameCounts.get(baseName) ?? 0) + 1
    nameCounts.set(baseName, count)

    return count === 1 ? baseName : `${file.title}(${count}).${file.extension}`
  }

  const downloadFolder = async (folderId) => {
    const folder = folders.value.find(f => f.id === Number(folderId))
    const files = decodeFileList(await getFilesApi(folderId))

    const zip = new JSZip()
    const nameCounts = new Map()

    for (const file of files) {
      zip.file(resolveUniqueEntryName(file, nameCounts), file.content ?? '')
    }

    const blob = await zip.generateAsync({ type: 'blob' })

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
    deleteFolder,
    downloadFolder,
    reset
  }
})
