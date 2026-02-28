<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { useRouter } from 'vue-router'
import { addUser } from '@/api/userApi'
import { modifyUser } from '@/api/userApi'

const authStore = useAuthStore()
const chatStore = useChatStore()

const router = useRouter()

const hiddenInput = ref('')
const dialog = ref(false)

const newUsername = ref('')
const newPassword = ref('')

const logout = async () => {
  chatStore.reset()
  authStore.signout()
  router.replace('/signin')
}

const handleHiddenInput = async () => {
  const value = hiddenInput.value.trim()

  if (!value.startsWith('createuser_')) return

  const parts = value.split('_')

  if (parts.length !== 3) return

  const username = parts[1]
  const password = parts[2]

  await addUser({ username, password })

  hiddenInput.value = ''
}

const openProfileModal = () => {
  newUsername.value = authStore.username
  newPassword.value = ''
  dialog.value = true
}

const updateUser = async () => {
  await modifyUser({ username: newUsername.value, password: newPassword.value })
  authStore.setUsername(newUsername.value)
  dialog.value = false
}
</script>

<template>
  <v-app-bar app elevation="1">

    <div class="header-left">
      <v-text-field v-model="hiddenInput" density="compact" hide-details variant="plain" class="easter-input"
        @keyup.enter="handleHiddenInput" />
    </div>

    <v-spacer />

    <div class="header-right">
      <span class="text-subtitle-2 username-text clickable" @click="openProfileModal">
        {{ authStore.username }}
      </span>

      <v-btn color="error" variant="text" @click="logout">
        Logout
      </v-btn>
    </div>

  </v-app-bar>

  <!-- 계정 설정 모달 -->
  <v-dialog v-model="dialog" width="400">
    <v-card>
      <v-card-title>Account Settings</v-card-title>

      <v-card-text>
        <v-text-field v-model="newUsername" label="Username" density="compact" />

        <v-text-field v-model="newPassword" label="New Password" type="password" density="compact" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">Cancel</v-btn>
        <v-btn @click="updateUser">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username-text {
  position: relative;
  top: 2px;
}

.clickable {
  cursor: pointer;
  transition: opacity 0.15s;
}

.clickable:hover {
  opacity: 0.7;
}

.easter-input {
  max-width: 200px;
  margin-left: 8px;
  opacity: 0.05;
  transition: opacity 0.2s;
}

.easter-input:focus-within {
  opacity: 1;
}
</style>