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

  const createFolder = async (name, parentId = null) => {
    const folder = await createFolderApi({ name, parentId })
    folders.value.unshift(folder)
    return folder
  }

  // 주어진 부모 아래 같은 이름의 폴더가 이미 있으면 그걸 쓰고, 없으면 새로 만든다 (경로 입력으로 폴더 자동 생성 시 사용)
  const getOrCreateFolder = async (name, parentId) => {
    const existing = folders.value.find(
      f => f.name === name && (f.parentId ?? null) === (parentId ?? null)
    )
    if (existing) return existing

    return createFolder(name, parentId)
  }

  const childrenOf = (parentId) =>
    folders.value.filter(f => (f.parentId ?? null) === (parentId ?? null))

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

  // 서버가 하위 폴더까지 재귀적으로 지우므로, 로컬 상태에서도 대상 폴더 + 모든 하위 폴더를 같이 지운다
  const collectSubtreeIds = (folderId) => {
    const ids = [Number(folderId)]

    for (let i = 0; i < ids.length; i++) {
      childrenOf(ids[i]).forEach(child => ids.push(child.id))
    }

    return ids
  }

  const deleteFolder = async (folderId) => {
    await deleteFolderApi(folderId)

    const removedIds = new Set(collectSubtreeIds(folderId))
    folders.value = folders.value.filter(f => !removedIds.has(f.id))
    removedIds.forEach(id => delete filesByFolder.value[id])
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
    getOrCreateFolder,
    childrenOf,
    loadFiles,
    createFile,
    deleteFolder,
    downloadFolder,
    reset
  }
})
