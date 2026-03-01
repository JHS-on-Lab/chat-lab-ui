<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'

const authStore = useAuthStore()
const chatStore = useChatStore()

const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const submit = async () => {
  try {
    chatStore.reset()

    await authStore.signin({
      username: username.value,
      password: password.value,
    })
    router.push('/chat')
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400" elevation="2">
      <v-card-title class="text-h6 text-center">
        Sign In
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="submit">
          <v-text-field v-model="username" label="Username" variant="outlined" density="comfortable" required />

          <v-text-field v-model="password" label="Password" type="password" variant="outlined" density="comfortable"
            required />

          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-2" density="comfortable">
            {{ errorMessage }}
          </v-alert>

          <v-btn type="submit" color="primary" block class="mt-2">
            Sign In
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>