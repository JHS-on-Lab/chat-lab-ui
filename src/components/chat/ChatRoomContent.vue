<template>
  <div v-if="!chatStore.selectedRoomId" class="d-flex align-center justify-center fill-height">
    참여 중인 채팅방이 없습니다
  </div>

  <div v-else class="fill-height d-flex flex-column">

    <div class="pa-3 border-b">
      <v-chip v-for="member in currentMembers" :key="member" size="small" class="mr-2">
        {{ member }}
      </v-chip>
    </div>

    <div class="flex-grow-1 overflow-y-auto pa-4">
      <div v-for="msg in currentMessages" :key="msg.id">
        <div class="text-caption">{{ msg.sender }}</div>
        <div>{{ msg.content }}</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useChatStore } from '@/stores/chatStore'

const chatStore = useChatStore()

const currentMessages = computed(() =>
  chatStore.messages[chatStore.selectedRoomId] || []
)

const currentMembers = computed(() =>
  chatStore.members[chatStore.selectedRoomId] || []
)

watch(
  () => chatStore.selectedRoomId,
  async (id) => {
    if (id) {
      await chatStore.loadRoomDetail(id)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}
</style>