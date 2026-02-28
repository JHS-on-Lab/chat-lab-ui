
<script setup>
import { ref } from 'vue'
import { useChatStore } from '@/stores/chatStore'

const chatStore = useChatStore()

const dialog = ref(false)
const roomName = ref('')

const close = () => {
  dialog.value = false
  roomName.value = ''
}

const create = async () => {
  if (!roomName.value.trim()) return

  await chatStore.createRoom(roomName.value)

  close()
}

const leave = async (roomId) => {
  await chatStore.leaveRoom(roomId)
}
</script>

<template>
  <v-list density="compact">

    <!-- 새 채팅방 버튼 -->
    <v-list-item>
      <v-btn block size="small" @click="dialog = true">
        + New Room
      </v-btn>
    </v-list-item>

    <v-divider />

    <!-- 채팅방 목록 -->
    <v-list-item v-for="room in chatStore.rooms" :key="room.id" :active="room.id === chatStore.selectedRoomId"
      @click="chatStore.selectRoom(room.id)">
      <v-list-item-title>
        {{ room.name }}
      </v-list-item-title>

      <!-- 나가기 버튼 -->
      <template #append>
        <v-btn icon="mdi-close" size="small" variant="text" color="grey" @click.stop="leave(room.id)" />
      </template>
    </v-list-item>

  </v-list>

  <!-- 채팅방 생성 Dialog -->
  <v-dialog v-model="dialog" width="400">
    <v-card>
      <v-card-title>Create Room</v-card-title>

      <v-card-text>
        <v-text-field v-model="roomName" label="Room Name" density="compact" @keyup.enter="create" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Cancel</v-btn>
        <v-btn @click="create">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
