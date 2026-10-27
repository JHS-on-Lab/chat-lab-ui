import {
  getFolders as getFoldersApi,
  createFolder as createFolderApi,
  getFiles as getFilesApi,
  createFile as createFileApi,
  updateFile as updateFileApi,
  deleteFile as deleteFileApi,
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

  const updateFile = async (folderId, fileId, payload) => {
    const updated = await updateFileApi(folderId, fileId, encodeFile(payload))
    const file = decodeFile(updated)

    const list = filesByFolder.value[folderId]
    if (list) {
      const idx = list.findIndex(f => f.id === fileId)
      if (idx !== -1) list[idx] = file
    }

    return file
  }

  const deleteFile = async (folderId, fileId) => {
    await deleteFileApi(folderId, fileId)

    const list = filesByFolder.value[folderId]
    if (list) {
      filesByFolder.value[folderId] = list.filter(f => f.id !== fileId)
    }
  }

  // 서버가 하위 폴더까지 재귀적으로 지우므로, 로컬 상태에서도 대상 폴더 + 모든 하위 폴더를 같이 지운다
  const collectSubtreeIds = (folderId) => {
    const ids = [Number(folderId)]

    for (let i = 0; i < ids.length; i++) {
      childrenOf(ids[i]).forEach(child => ids.push(child.id))
    }

    return ids
  }

  /**
   * @returns {Set<number>} 삭제된 폴더 id 목록 (대상 폴더 + 모든 하위 폴더)
   */
  const deleteFolder = async (folderId) => {
    await deleteFolderApi(folderId)

    const removedIds = new Set(collectSubtreeIds(folderId))
    folders.value = folders.value.filter(f => !removedIds.has(f.id))
    removedIds.forEach(id => delete filesByFolder.value[id])

    return removedIds
  }

  const resolveUniqueEntryName = (file, nameCounts) => {
    const baseName = `${file.title}.${file.extension}`
    const count = (nameCounts.get(baseName) ?? 0) + 1
    nameCounts.set(baseName, count)

    return count === 1 ? baseName : `${file.title}(${count}).${file.extension}`
  }

  // 대상 폴더를 기준으로 자기 자신('') + 모든 하위 폴더를 zip 안에서의 상대 경로에 매핑한다
  const buildFolderPathMap = (rootId) => {
    const paths = new Map([[rootId, '']])
    const queue = [rootId]

    for (let i = 0; i < queue.length; i++) {
      const currentId = queue[i]
      const currentPath = paths.get(currentId)

      for (const child of childrenOf(currentId)) {
        paths.set(child.id, currentPath ? `${currentPath}/${child.name}` : child.name)
        queue.push(child.id)
      }
    }

    return paths
  }

  const downloadFolder = async (folderId) => {
    const rootId = Number(folderId)
    const folder = folders.value.find(f => f.id === rootId)
    const folderPaths = buildFolderPathMap(rootId)

    const zip = new JSZip()
    const nameCountsByDir = new Map()

    for (const [id, dirPath] of folderPaths) {
      const files = decodeFileList(await getFilesApi(id))
      if (files.length === 0) continue

      if (!nameCountsByDir.has(dirPath)) nameCountsByDir.set(dirPath, new Map())
      const nameCounts = nameCountsByDir.get(dirPath)

      for (const file of files) {
        const entryName = resolveUniqueEntryName(file, nameCounts)
        zip.file(dirPath ? `${dirPath}/${entryName}` : entryName, file.content ?? '')
      }
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
    updateFile,
    deleteFile,
    deleteFolder,
    downloadFolder,
    reset
  }
})
