<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { formatMessage, isSafeImageSrc } from '@/lib/textFormatter'
import { useDisplay } from 'vuetify'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { smAndDown } = useDisplay()

const MAX_MESSAGE_LENGTH = 20000

const text = ref('')
const dialog = ref(false)
const memberDialog = ref(false)
const inviteUsername = ref('')
const errorMessage = ref('')
const scrollBox = ref(null)

const currentMessages = computed(() => chatStore.currentMessages)
const currentMembers = computed(() => chatStore.currentMembers)

const isTooLong = computed(() => text.value.length > MAX_MESSAGE_LENGTH)

const messageError = computed(() => {
  if (isTooLong.value) {
    return `메시지는 ${MAX_MESSAGE_LENGTH.toLocaleString()}자 이하만 전송할 수 있습니다.`
  }
  // 연결 끊김 / 서버 거부 등 전송 실패 사유
  return chatStore.sendError
})

const canSend = computed(() => {
  return text.value.trim().length > 0 && !isTooLong.value
})

// username 은 변경될 수 있으므로 사용자 id 로 비교
const isMine = (msg) =>
  msg.senderId === authStore.userId

const handleSend = () => {
  if (!canSend.value) return

  // 전송에 실패하면 입력 내용을 유지해 다시 보낼 수 있게 한다
  if (chatStore.sendMessage(text.value)) {
    text.value = ''
  }
}

// 맨 위로 스크롤하면 이전 메시지를 불러오고, 보던 위치를 유지한다
const handleScroll = async () => {
  const el = scrollBox.value
  if (!el || el.scrollTop !== 0) return

  const prevHeight = el.scrollHeight
  const loaded = await chatStore.loadRoomMessages(chatStore.selectedRoomId)
  if (!loaded) return

  await nextTick()
  el.scrollTop = el.scrollHeight - prevHeight
}

const openInviteDialog = () => {
  inviteUsername.value = ''
  errorMessage.value = ''
  dialog.value = true
}

const invite = async () => {
  if (!inviteUsername.value.trim()) return
  try {
    await chatStore.inviteMember(
      chatStore.selectedRoomId,
      inviteUsername.value.trim()
    )
    dialog.value = false
  } catch (error) {
    errorMessage.value = error.message
  }
}

const copyMessage = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (e) {
    console.error('복사 실패', e)
  }
}

const scrollToBottom = async () => {
  await nextTick()

  const el = scrollBox.value
  if (!el) return

  el.scrollTop = el.scrollHeight
}

watch(
  () => chatStore.selectedRoomId,
  scrollToBottom
)

// 새 메시지가 아래에 추가될 때만 맨 아래로 이동 (이전 메시지 로딩 시에는 이동하지 않음)
watch(
  () => currentMessages.value.at(-1)?.id,
  scrollToBottom
)

onMounted(scrollToBottom)
</script>

<template>
  <div v-if="!chatStore.selectedRoomId" class="empty">
    참여 중인 채팅방이 없습니다
  </div>

  <div v-else class="chat-root">

    <div class="chat-header">

      <div class="left-area">
        <template v-if="!smAndDown">
          <v-chip v-for="member in currentMembers" :key="member" size="small" class="mr-2">
            {{ member }}
          </v-chip>
        </template>

        <v-btn v-else size="small" variant="text" @click="memberDialog = true">
          Members
        </v-btn>
      </div>

      <v-btn size="small" variant="text" @click="openInviteDialog">
        Invite
      </v-btn>

    </div>

    <div ref="scrollBox" class="messages-area" @scroll="handleScroll">
      <div v-for="msg in currentMessages" :key="msg.id" class="message" :class="{ mine: isMine(msg) }">

        <div v-if="!isMine(msg)" class="sender">
          {{ msg.senderName }}
        </div>

        <div v-if="msg.type === 'TEXT'" class="bubble-row">
          <div class="bubble" v-html="formatMessage(msg.content)" />

          <v-btn icon size="x-small" variant="text" class="copy-btn" @click="copyMessage(msg.content)">
            <v-icon size="16">mdi-content-copy</v-icon>
          </v-btn>
        </div>

        <img v-if="msg.type === 'IMAGE' && isSafeImageSrc(msg.content)" :src="msg.content" class="bubble image" />

      </div>
    </div>

    <div class="input-area">
      <v-textarea
        v-model="text"
        rows="1"
        auto-grow
        max-rows="3"
        no-resize
        density="compact"
        hide-details="auto"
        placeholder="메시지 입력..."
        class="flex-grow-1"
        :counter="MAX_MESSAGE_LENGTH"
        :error="!!messageError"
        :error-messages="messageError ? [messageError] : []"
        @keydown.enter.exact.prevent="handleSend"
      />

      <v-btn
        size="small"
        class="send-btn"
        :disabled="!canSend"
        @click="handleSend"
      >
        Send
      </v-btn>
    </div>

  </div>

  <v-dialog v-model="dialog" width="400">
    <v-card>
      <v-card-title>Invite Member</v-card-title>

      <v-card-text>
        <v-text-field v-model="inviteUsername" label="Username" density="compact" @keyup.enter="invite" />

        <v-alert v-if="errorMessage" type="error" variant="tonal" density="comfortable">
          {{ errorMessage }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">Cancel</v-btn>
        <v-btn @click="invite">Invite</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="memberDialog" width="400">
    <v-card>
      <v-card-title>Members</v-card-title>

      <v-card-text>
        <v-chip v-for="member in currentMembers" :key="member" size="small" class="ma-1">
          {{ member }}
        </v-chip>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="memberDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.chat-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.chat-header {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

.message.mine {
  align-items: flex-end;
}

.sender {
  font-size: 12px;
  margin-bottom: 4px;
  color: #666;
}

.bubble-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.message.mine .bubble-row {
  flex-direction: row-reverse;
}

.bubble {
  white-space: pre-wrap;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 85%;
  word-break: break-word;
}

.message.mine .bubble {
  background: #ffe812;
}

.image {
  max-width: 300px;
  border-radius: 12px;
}

.copy-btn {
  opacity: 0;
  transition: opacity 0.2s;
  padding: 0;
  min-width: auto;
}

.message:hover .copy-btn {
  opacity: 1;
}

.input-area {
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.send-btn {
  height: 40px;
  align-self: flex-start;
}
</style>