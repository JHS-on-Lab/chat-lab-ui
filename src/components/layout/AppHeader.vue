<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { modifyUser } from '@/api/userApi'
import { refreshAccessToken } from '@/lib/axios'

const authStore = useAuthStore()

const dialog = ref(false)

const currentPassword = ref('')
const newUsername = ref('')
const newPassword = ref('')
const profileError = ref('')

const openProfileModal = () => {
  currentPassword.value = ''
  newUsername.value = authStore.username
  newPassword.value = ''
  profileError.value = ''
  dialog.value = true
}

const updateUser = async () => {
  profileError.value = ''

  try {
    await modifyUser({
      currentPassword: currentPassword.value,
      username: newUsername.value,
      password: newPassword.value
    })
  } catch (e) {
    profileError.value = e.message
    return
  }

  authStore.setUsername(newUsername.value)
  // 변경된 username 이 access token 클레임에도 반영되도록 재발급
  await refreshAccessToken()
  dialog.value = false
}
</script>

<template>
  <v-app-bar app elevation="1">

    <v-spacer />

    <div class="header-right">
      <v-btn variant="text" size="small" class="mr-2" to="/chat">
        Chat
      </v-btn>

      <v-btn variant="text" size="small" class="mr-2" to="/game">
        Game
      </v-btn>

      <v-btn variant="text" size="small" class="mr-2" to="/files">
        Files
      </v-btn>

      <v-btn v-if="authStore.isAdmin" variant="text" size="small" class="mr-2" to="/admin/users">
        Admin
      </v-btn>

      <v-btn variant="text" size="small" class="mr-2" @click="openProfileModal">
        {{ authStore.username }}
      </v-btn>

      <v-btn color="error" size="small" variant="text" @click="authStore.signout()">
        Logout
      </v-btn>
    </div>

  </v-app-bar>

  <!-- 계정 설정 모달 -->
  <v-dialog v-model="dialog" width="400">
    <v-card>
      <v-card-title>Account Settings</v-card-title>

      <v-card-text>
        <v-text-field v-model="currentPassword" label="Current Password" type="password" density="compact" />

        <v-text-field v-model="newUsername" label="Username" density="compact" />

        <v-text-field v-model="newPassword" label="New Password" type="password" density="compact" />

        <v-alert v-if="profileError" type="error" variant="tonal" density="compact">
          {{ profileError }}
        </v-alert>
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
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.clickable {
  cursor: pointer;
  transition: opacity 0.15s;
}

.clickable:hover {
  opacity: 0.7;
}
</style>
