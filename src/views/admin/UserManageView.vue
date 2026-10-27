<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/stores/authStore'
import { addUser, getUsers, modifyUserByAdmin, changeUserStatus, deleteUser } from '@/api/userApi'

const authStore = useAuthStore()

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

// 본인 계정은 관리자 기능으로 변경할 수 없음 (서버에서도 차단)
const isSelf = (user) => user.id === authStore.userId

// 목록 작업(활성화 변경) 결과 메시지
const listError = ref('')
const statusLoadingId = ref(null)

const toggleStatus = async (user) => {
  listError.value = ''
  statusLoadingId.value = user.id
  try {
    const updated = await changeUserStatus(user.id, !user.enabled)
    user.enabled = updated.enabled
  } catch (e) {
    listError.value = toErrorMessage(e, '상태 변경에 실패했습니다.')
  } finally {
    statusLoadingId.value = null
  }
}

// 수정 다이얼로그
const editDialog = ref(false)
const editTarget = ref(null)
const editUsername = ref('')
const editPassword = ref('')
const editRole = ref('ROLE_USER')
const editError = ref('')
const editSubmitting = ref(false)

const openEdit = (user) => {
  editTarget.value = user
  editUsername.value = user.username
  editPassword.value = ''
  editRole.value = user.role
  editError.value = ''
  editDialog.value = true
}

const submitEdit = async () => {
  editError.value = ''

  if (!editUsername.value.trim()) {
    editError.value = '아이디를 입력해 주세요.'
    return
  }

  editSubmitting.value = true
  try {
    await modifyUserByAdmin(editTarget.value.id, {
      username: editUsername.value.trim(),
      password: editPassword.value,
      role: editRole.value
    })
    editDialog.value = false
    await loadUsers()
  } catch (e) {
    editError.value = toErrorMessage(e, '유저 수정에 실패했습니다.')
  } finally {
    editSubmitting.value = false
  }
}

// 삭제 다이얼로그: 되돌릴 수 없으므로 아이디를 직접 입력해야 삭제 가능
const deleteDialog = ref(false)
const deleteTarget = ref(null)
const deleteConfirmText = ref('')
const deleteError = ref('')
const deleteSubmitting = ref(false)

const openDelete = (user) => {
  deleteTarget.value = user
  deleteConfirmText.value = ''
  deleteError.value = ''
  deleteDialog.value = true
}

const submitDelete = async () => {
  deleteError.value = ''
  deleteSubmitting.value = true
  try {
    await deleteUser(deleteTarget.value.id)
    deleteDialog.value = false
    // 현재 페이지의 마지막 유저를 지운 경우 이전 페이지로
    if (users.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await loadUsers()
  } catch (e) {
    deleteError.value = toErrorMessage(e, '유저 삭제에 실패했습니다.')
  } finally {
    deleteSubmitting.value = false
  }
}

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

                <v-alert v-if="listError" type="error" variant="tonal" class="mb-2" density="comfortable" closable
                  @click:close="listError = ''">
                  {{ listError }}
                </v-alert>

                <v-table density="comfortable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th class="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users" :key="user.id" :class="{ 'text-disabled': !user.enabled }">
                      <td>{{ user.id }}</td>
                      <td>
                        {{ user.username }}
                        <span v-if="isSelf(user)" class="text-caption text-medium-emphasis">(me)</span>
                      </td>
                      <td>
                        <v-chip size="small" :color="user.role === 'ROLE_ADMIN' ? 'primary' : undefined">
                          {{ user.role === 'ROLE_ADMIN' ? 'Admin' : 'User' }}
                        </v-chip>
                      </td>
                      <td>
                        <v-switch :model-value="user.enabled" color="success" density="compact" hide-details inset
                          :disabled="isSelf(user)" :loading="statusLoadingId === user.id"
                          @update:model-value="toggleStatus(user)" />
                      </td>
                      <td class="text-caption">{{ formatDate(user.createdAt) }}</td>
                      <td class="text-right text-no-wrap">
                        <v-btn icon="mdi-pencil" size="small" variant="text" :disabled="isSelf(user)"
                          @click="openEdit(user)" />
                        <v-btn icon="mdi-delete" size="small" variant="text" color="error" :disabled="isSelf(user)"
                          @click="openDelete(user)" />
                      </td>
                    </tr>
                    <tr v-if="!loading && users.length === 0">
                      <td colspan="6" class="text-center text-medium-emphasis">유저가 없습니다.</td>
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

      <!-- 유저 수정 -->
      <v-dialog v-model="editDialog" width="420">
        <v-card>
          <v-card-title>Edit User</v-card-title>

          <v-card-text>
            <v-text-field v-model="editUsername" label="Username" variant="outlined" density="comfortable" />

            <v-text-field v-model="editPassword" label="New Password" type="password" variant="outlined"
              density="comfortable" hint="비워 두면 기존 비밀번호를 유지합니다." persistent-hint class="mb-2" />

            <v-select v-model="editRole" :items="roleOptions" label="Role" variant="outlined"
              density="comfortable" />

            <v-alert v-if="editError" type="error" variant="tonal" density="comfortable">
              {{ editError }}
            </v-alert>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn text @click="editDialog = false">Cancel</v-btn>
            <v-btn color="primary" :loading="editSubmitting" @click="submitEdit">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 유저 삭제 -->
      <v-dialog v-model="deleteDialog" width="460">
        <v-card v-if="deleteTarget">
          <v-card-title class="text-error">Delete User</v-card-title>

          <v-card-text>
            <p class="mb-2">
              <strong>'{{ deleteTarget.username }}'</strong> 계정과 관련된 아래 데이터가 <strong>영구 삭제</strong>되며 되돌릴 수 없습니다.
            </p>
            <ul class="mb-4 ml-5">
              <li>보낸 모든 채팅 메시지 및 채팅방 참여 정보 (혼자 남아 있던 방은 방째 삭제)</li>
              <li>모든 폴더와 파일</li>
              <li>모든 게임 점수 기록</li>
            </ul>
            <p class="mb-2 text-medium-emphasis">로그인만 막으려면 삭제 대신 Status 를 끄세요.</p>

            <v-text-field v-model="deleteConfirmText" :label="`확인을 위해 '${deleteTarget.username}' 입력`"
              variant="outlined" density="comfortable" />

            <v-alert v-if="deleteError" type="error" variant="tonal" density="comfortable">
              {{ deleteError }}
            </v-alert>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn text @click="deleteDialog = false">Cancel</v-btn>
            <v-btn color="error" :loading="deleteSubmitting"
              :disabled="deleteConfirmText !== deleteTarget.username" @click="submitDelete">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>
