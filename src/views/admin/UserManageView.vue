<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { addUser, getUsers } from '@/api/userApi'

const PAGE_SIZE = 10

const roleOptions = [
  { title: 'User', value: 'ROLE_USER' },
  { title: 'Admin', value: 'ROLE_ADMIN' },
]

// 생성 폼
const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
const role = ref('ROLE_USER')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 유저 목록
const users = ref([])
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)

const toErrorMessage = (e, fallback) => e?.message ?? fallback

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers({ page: page.value - 1, size: PAGE_SIZE })
    users.value = res.content
    totalPages.value = Math.max(res.totalPages, 1)
  } catch (e) {
    errorMessage.value = toErrorMessage(e, '유저 목록을 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  username.value = ''
  password.value = ''
  passwordConfirm.value = ''
  role.value = 'ROLE_USER'
}

const submit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!username.value.trim() || !password.value) {
    errorMessage.value = '아이디와 비밀번호를 입력해 주세요.'
    return
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  submitting.value = true
  try {
    const created = await addUser({
      username: username.value.trim(),
      password: password.value,
      role: role.value
    })
    successMessage.value = `'${created.username}' 계정을 생성했습니다.`
    resetForm()
    page.value = 1
    await loadUsers()
  } catch (e) {
    errorMessage.value = toErrorMessage(e, '유저 생성에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

const formatDate = (value) => value ? new Date(value).toLocaleString() : '-'

onMounted(loadUsers)
</script>

<template>
  <v-app>
    <AppHeader />

    <v-main>
      <v-container class="py-6" style="max-width: 1000px;">
        <v-row>
          <!-- 신규 유저 생성 -->
          <v-col cols="12" md="5">
            <v-card elevation="2">
              <v-card-title class="text-h6">New User</v-card-title>

              <v-card-text>
                <v-form @submit.prevent="submit">
                  <v-text-field v-model="username" label="Username" variant="outlined" density="comfortable" />

                  <v-text-field v-model="password" label="Password" type="password" variant="outlined"
                    density="comfortable" />

                  <v-text-field v-model="passwordConfirm" label="Confirm Password" type="password" variant="outlined"
                    density="comfortable" />

                  <v-select v-model="role" :items="roleOptions" label="Role" variant="outlined"
                    density="comfortable" />

                  <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-2" density="comfortable">
                    {{ errorMessage }}
                  </v-alert>

                  <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-2" density="comfortable">
                    {{ successMessage }}
                  </v-alert>

                  <v-btn type="submit" color="primary" block :loading="submitting">
                    Create
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 유저 목록 -->
          <v-col cols="12" md="7">
            <v-card elevation="2">
              <v-card-title class="text-h6">Users</v-card-title>

              <v-card-text>
                <v-progress-linear v-if="loading" indeterminate class="mb-2" />

                <v-table density="comfortable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users" :key="user.id">
                      <td>{{ user.id }}</td>
                      <td>{{ user.username }}</td>
                      <td>
                        <v-chip size="small" :color="user.role === 'ROLE_ADMIN' ? 'primary' : undefined">
                          {{ user.role === 'ROLE_ADMIN' ? 'Admin' : 'User' }}
                        </v-chip>
                      </td>
                      <td>{{ formatDate(user.createdAt) }}</td>
                    </tr>
                    <tr v-if="!loading && users.length === 0">
                      <td colspan="4" class="text-center text-medium-emphasis">유저가 없습니다.</td>
                    </tr>
                  </tbody>
                </v-table>

                <v-pagination v-if="totalPages > 1" v-model="page" :length="totalPages" density="comfortable"
                  class="mt-2" @update:model-value="loadUsers" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
