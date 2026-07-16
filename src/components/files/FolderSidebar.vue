<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFileStore } from '@/stores/fileStore'
import { useDisplay } from 'vuetify'

const fileStore = useFileStore()
const router = useRouter()
const route = useRoute()
const { smAndDown } = useDisplay()

const dialog = ref(false)
const folderName = ref('')

const deleteDialog = ref(false)
const folderToDelete = ref(null)

onMounted(() => {
  fileStore.loadFolders()
})

const close = () => {
  dialog.value = false
  folderName.value = ''
}

const create = async () => {
  if (!folderName.value.trim()) return
  const folder = await fileStore.createFolder(folderName.value)
  close()
  router.push(`/files/${folder.id}`)
}

const open = (folderId) => {
  router.push(`/files/${folderId}`)
}

const confirmDelete = (folder) => {
  folderToDelete.value = folder
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  folderToDelete.value = null
}

const deleteFolder = async () => {
  const folder = folderToDelete.value
  if (!folder) return

  await fileStore.deleteFolder(folder.id)

  if (String(folder.id) === route.params.folderId) {
    router.push('/files')
  }

  closeDeleteDialog()
}
</script>

<template>
  <v-list density="compact">

    <!-- 새 폴더 버튼 -->
    <v-list-item class="create-folder-btn-wrapper" @click="dialog = true" link>
      <v-list-item-title class="d-flex align-center justify-center">
        <v-icon start size="x-small">mdi-plus</v-icon>
        <span v-if="!smAndDown">New Folder</span>
      </v-list-item-title>
    </v-list-item>

    <v-divider />

    <!-- 폴더 목록 -->
    <v-list-item v-for="folder in fileStore.folders" :key="folder.id"
      :active="String(folder.id) === route.params.folderId" @click="open(folder.id)" link>
      <v-list-item-title class="d-flex align-center justify-center">
        <v-icon start size="x-small">mdi-folder</v-icon>
        <span v-if="!smAndDown">{{ folder.name }}</span>
      </v-list-item-title>

      <template #append v-if="!smAndDown">
        <v-btn icon="mdi-delete-outline" size="x-small" variant="text"
          @click.stop="confirmDelete(folder)" />
      </template>
    </v-list-item>

  </v-list>

  <!-- 폴더 생성 Dialog -->
  <v-dialog v-model="dialog" width="400">
    <v-card>
      <v-card-title>Create Folder</v-card-title>

      <v-card-text>
        <v-text-field v-model="folderName" label="Folder Name" density="compact" @keyup.enter="create" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Cancel</v-btn>
        <v-btn @click="create">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 폴더 삭제 확인 Dialog -->
  <v-dialog v-model="deleteDialog" width="400">
    <v-card>
      <v-card-title>Delete Folder</v-card-title>

      <v-card-text>
        '{{ folderToDelete?.name }}' 폴더와 그 안의 모든 파일이 삭제됩니다. 계속하시겠습니까?
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDeleteDialog">Cancel</v-btn>
        <v-btn color="error" @click="deleteFolder">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.create-folder-btn-wrapper {
  min-height: 44px;
  display: flex;
  justify-content: center;
}
</style>
