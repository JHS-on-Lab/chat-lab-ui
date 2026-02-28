<template>
  <DefaultLayout>
    <template #sidebar>
      <ChatRoomSidebar />
    </template>

    <template #content>
      <ChatRoomContent />
    </template>
  </DefaultLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ChatRoomSidebar from '@/components/chat/ChatRoomSidebar.vue'
import ChatRoomContent from '@/components/chat/ChatRoomContent.vue'
import { useChatStore } from '@/stores/chatStore'

const chatStore = useChatStore()

onMounted(async () => {
  await chatStore.initialize()
})
</script>