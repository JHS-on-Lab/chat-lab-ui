<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.signout()
  router.push('/signin')
}

function goMyPage() {
  router.push('/mypage')
}
</script>

<template>
  <v-app-bar app elevation="1">
    <v-spacer />

    <div class="d-flex align-center ga-4">
      <span class="text-subtitle-2">
        {{ authStore.username }}
      </span>

      <v-btn variant="text" @click="goMyPage">
        MyPage
      </v-btn>

      <v-btn color="error" variant="text" @click="logout">
        Logout
      </v-btn>
    </div>
  </v-app-bar>
</template>
