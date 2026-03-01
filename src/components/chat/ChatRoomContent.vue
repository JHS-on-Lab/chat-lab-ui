<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { formatMessage } from '@/lib/textFormatter'

const chatStore = useChatStore()
const authStore = useAuthStore()

const text = ref('')
const dialog = ref(false)
const inviteUsername = ref('')
const errorMessage = ref('')
const scrollBox = ref(null)

const currentMessages = computed(() => chatStore.currentMessages)
const currentMembers = computed(() => chatStore.currentMembers)

const isMine = (msg) =>
  msg.senderName === authStore.username

const handleSend = async () => {
  if (!text.value.trim()) return
  chatStore.sendMessage(text.value)
  text.value = ''
}

const handleScroll = async () => {
  const el = scrollBox.value
  if (!el) return
  if (el.scrollTop === 0) {
    await chatStore.loadRoomMessages(chatStore.selectedRoomId)
  }
}

const invite = async () => {
  if (!inviteUsername.value.trim()) return
  try {
    await chatStore.inviteMember(
      chatStore.selectedRoomId,
      inviteUsername.value
    )
    dialog.value = false
    inviteUsername.value = ''
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

watch(
  () => chatStore.messages[chatStore.selectedRoomId]?.length,
  async () => {
    await nextTick()

    const el = scrollBox.value
    if (!el) return

    el.scrollTop = el.scrollHeight
    console.log(formatMessage(currentMessages))
  }
)
</script>

<template>
  <div v-if="!chatStore.selectedRoomId" class="empty">
    참여 중인 채팅방이 없습니다
  </div>

  <div v-else class="chat-root">

    <!-- 상단 -->
    <div class="chat-header">
      <div>
        <v-chip v-for="member in currentMembers" :key="member" size="small" class="mr-2">
          {{ member }}
        </v-chip>
      </div>

      <v-btn size="small" variant="text" @click="dialog = true">
        Invite
      </v-btn>
    </div>

    <!-- 메시지 영역 -->
    <div ref="scrollBox" class="messages-area" @scroll="handleScroll">
      <div v-for="msg in currentMessages" :key="msg.id" class="message" :class="{ mine: isMine(msg) }">

        <div v-if="!isMine(msg)" class="sender">
          {{ msg.senderName }}
        </div>

        <!-- TEXT -->
        <div v-if="msg.type === 'TEXT'" class="bubble-row">

          <div class="bubble" v-html="formatMessage(msg.content)" />

          <v-btn icon size="x-small" variant="text" class="copy-btn" @click="copyMessage(msg.content)">
            <v-icon size="16">mdi-content-copy</v-icon>
          </v-btn>

        </div>

        <!-- IMAGE -->
        <img v-if="msg.type === 'IMAGE'" :src="msg.content" class="bubble image" />

      </div>
    </div>

    <!-- 입력 영역 -->
    <div class="input-area">
      <v-textarea v-model="text" rows="1" auto-grow max-rows="3" no-resize hide-details density="compact"
        placeholder="메시지 입력..." class="flex-grow-1" @keydown.enter.exact.prevent="handleSend" />

      <v-btn size="small" class="send-btn" @click="handleSend">
        Send
      </v-btn>
    </div>

  </div>

  <!-- 초대 다이얼로그 -->
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

/* 메시지 정렬 */
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

/* 버블 + 복사버튼 라인 */
.bubble-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.message.mine .bubble-row {
  flex-direction: row-reverse;
}

/* 말풍선 */
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

/* 이미지 */
.image {
  max-width: 300px;
  border-radius: 12px;
}

/* 복사 버튼 */
.copy-btn {
  opacity: 0;
  transition: opacity 0.2s;
  padding: 0;
  min-width: auto;
}

.message:hover .copy-btn {
  opacity: 1;
}

/* 입력 영역 */
.input-area {
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.send-btn {
  height: 40px;
}
</style>