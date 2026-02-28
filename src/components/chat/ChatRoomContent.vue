<script setup>
import { computed, watch, ref } from 'vue'
import { useChatStore } from '@/stores/chatStore'

const chatStore = useChatStore()
const dialog = ref(false)
const inviteUsername = ref('')
const errorMessage = ref('')

const close = () => {
  dialog.value = false
  inviteUsername.value = ''
  errorMessage.value = ''
}

const invite = async () => {
  if (!inviteUsername.value.trim()) return
  try {
    await chatStore.inviteMember(chatStore.selectedRoomId, inviteUsername.value)
    close()
  } catch (error) {
    errorMessage.value = error.message
  }
}

const currentMembers = computed(() => chatStore.currentMembers)
const currentMessages = computed(() => chatStore.currentMessages)
</script>

<template>
  <div v-if="!chatStore.selectedRoomId" class="d-flex align-center justify-center fill-height">
    참여 중인 채팅방이 없습니다
  </div>

  <div v-else class="fill-height d-flex flex-column">

    <div class="pa-3 border-b d-flex align-center justify-space-between">

      <!-- 참가자 목록 -->
      <div>
        <v-chip v-for="member in currentMembers" :key="member" size="small" class="mr-2">
          {{ member }}
        </v-chip>
      </div>

      <!-- 초대 버튼 -->
      <v-btn size="small" variant="text" @click="dialog = true">
        Invite
      </v-btn>

    </div>

    <div class="flex-grow-1 overflow-y-auto pa-4">
      <div v-for="msg in currentMessages" :key="msg.id">
        <div class="text-caption">{{ msg.sender }}</div>
        <div>{{ msg.content }}</div>
      </div>
    </div>

  </div>

  <v-dialog v-model="dialog" width="400">
    <v-card>
      <v-card-title>Invite Member</v-card-title>

      <v-card-text>
        <v-text-field v-model="inviteUsername" label="Username" density="compact" @keyup.enter="invite" />
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-2" density="comfortable">
          {{ errorMessage }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Cancel</v-btn>
        <v-btn @click="invite">Invite</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}
</style>
