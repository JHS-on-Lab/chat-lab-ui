<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFileStore } from '@/stores/fileStore'
import { useDisplay } from 'vuetify'

const props = defineProps({
  folder: { type: Object, required: true },
  depth: { type: Number, default: 0 }
})

const emit = defineEmits(['add-subfolder', 'delete-request'])

const fileStore = useFileStore()
const router = useRouter()
const route = useRoute()
const { smAndDown } = useDisplay()

const expanded = ref(true)

const children = computed(() => fileStore.childrenOf(props.folder.id))
const hasChildren = computed(() => children.value.length > 0)
const isActive = computed(() => String(props.folder.id) === route.params.folderId)

const open = () => router.push(`/files/${props.folder.id}`)
const toggle = () => { expanded.value = !expanded.value }
</script>

<template>
  <v-list-item :active="isActive" @click="open" link>
    <v-list-item-title class="d-flex align-center" :style="{ paddingLeft: `${depth * 16}px` }">
      <v-icon v-if="hasChildren" size="x-small" class="mr-1" @click.stop="toggle">
        {{ expanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      </v-icon>
      <span v-else class="chevron-spacer" />
      <v-icon start size="x-small">mdi-folder</v-icon>
      <span v-if="!smAndDown">{{ folder.name }}</span>
    </v-list-item-title>

    <template #append v-if="!smAndDown">
      <v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="emit('add-subfolder', folder.id)" />
      <v-btn icon="mdi-delete-outline" size="x-small" variant="text" @click.stop="emit('delete-request', folder)" />
    </template>
  </v-list-item>

  <template v-if="expanded">
    <FolderTreeNode
      v-for="child in children"
      :key="child.id"
      :folder="child"
      :depth="depth + 1"
      @add-subfolder="emit('add-subfolder', $event)"
      @delete-request="emit('delete-request', $event)"
    />
  </template>
</template>

<style scoped>
.chevron-spacer {
  display: inline-block;
  width: 20px;
}
</style>
