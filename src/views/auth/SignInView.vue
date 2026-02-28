<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400" elevation="2">
      <v-card-title class="text-h6 text-center">
        Sign In
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="submit">
          <v-text-field
            v-model="username"
            label="Username"
            variant="outlined"
            density="comfortable"
            required
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            variant="outlined"
            density="comfortable"
            required
          />

          <v-btn
            type="submit"
            color="primary"
            block
            class="mt-4"
          >
            Sign In
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')

const submit = () => {
  console.log(username.value, password.value)

  // TODO: 로그인 성공 시
  // router.push('/chat')
}
</script>