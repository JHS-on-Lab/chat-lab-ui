<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFileStore } from '@/stores/fileStore'

const route = useRoute()
const router = useRouter()
const fileStore = useFileStore()

const createDialog = ref(false)
const previewDialog = ref(false)

const filename = ref('')
const content = ref('')

const previewFile = ref(null)

const folderId = computed(() => route.params.folderId)

const folder = computed(() =>
  fileStore.folders.find(f => String(f.id) === folderId.value)
)

const files = computed(() => fileStore.filesByFolder[folderId.value] || [])

const loadFiles = () => {
  if (folderId.value) {
    fileStore.loadFiles(folderId.value)
  }
}

onMounted(loadFiles)
watch(folderId, loadFiles)

const closeCreateDialog = () => {
  createDialog.value = false
  filename.value = ''
  content.value = ''
}

// "notes.md" -> { title: 'notes', extension: 'md' }. 점이 없거나 끝에 있으면 기본 확장자 txt로 처리.
// "archive.tar.gz"처럼 점이 여러 개면 마지막 점 기준으로 나눔.
const parseFilename = (name) => {
  const trimmed = name.trim()
  const lastDot = trimmed.lastIndexOf('.')

  if (lastDot <= 0 || lastDot === trimmed.length - 1) {
    return { title: trimmed.replace(/\.$/, ''), extension: 'txt' }
  }

  return {
    title: trimmed.slice(0, lastDot),
    extension: trimmed.slice(lastDot + 1)
  }
}

// "docs/guide.md"처럼 경로를 입력하면 없는 폴더는 자동 생성하면서 그 안에 파일을 만든다
const resolveTargetFolder = async (path) => {
  const segments = path.split('/').map(s => s.trim()).filter(Boolean)
  const filePart = segments.pop() ?? ''

  let parentId = Number(folderId.value)
  for (const folderName of segments) {
    const folder = await fileStore.getOrCreateFolder(folderName, parentId)
    parentId = folder.id
  }

  return { targetFolderId: parentId, filePart }
}

const createFile = async () => {
  if (!filename.value.trim()) return

  const { targetFolderId, filePart } = await resolveTargetFolder(filename.value)
  if (!filePart) return

  const { title, extension } = parseFilename(filePart)

  await fileStore.createFile(targetFolderId, { title, extension, content: content.value })

  if (String(targetFolderId) !== folderId.value) {
    router.push(`/files/${targetFolderId}`)
  }

  closeCreateDialog()
}

const openPreview = (file) => {
  previewFile.value = file
  previewDialog.value = true
}

const download = () => {
  fileStore.downloadFolder(folderId.value)
}
</script>

<template>
  <div class="folder-detail">
    <div class="folder-header">
      <h3>{{ folder?.name }}</h3>

      <div class="folder-actions">
        <v-btn variant="text" size="small" @click="createDialog = true">
          <v-icon start size="small">mdi-plus</v-icon>
          파일
        </v-btn>

        <v-btn variant="text" size="small" @click="download">
          <v-icon start size="small">mdi-download</v-icon>
          폴더 다운로드
        </v-btn>
      </div>
    </div>

    <v-list>
      <v-list-item v-for="file in files" :key="file.id" @click="openPreview(file)" link>
        <v-list-item-title>
          <v-icon start size="small">mdi-file-outline</v-icon>
          {{ file.title }}.{{ file.extension }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </div>

  <!-- 파일 생성 Dialog -->
  <v-dialog v-model="createDialog" width="500">
    <v-card>
      <v-card-title>Create File</v-card-title>

      <v-card-text>
        <v-text-field v-model="filename" label="파일명 (예: docs/notes.md)" density="compact" />
        <v-textarea v-model="content" label="Content" rows="8" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeCreateDialog">Cancel</v-btn>
        <v-btn @click="createFile">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 파일 미리보기 Dialog -->
  <v-dialog v-model="previewDialog" width="600">
    <v-card>
      <v-card-title>{{ previewFile?.title }}.{{ previewFile?.extension }}</v-card-title>

      <v-card-text>
        <pre class="preview-content">{{ previewFile?.content }}</pre>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="previewDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.folder-detail {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.folder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.preview-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
}
</style>
