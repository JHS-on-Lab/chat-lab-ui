import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signin as signinApi, signoutApi } from '@/api/authApi'
import { getMyInfo as getMyInfoApi } from '@/api/userApi'
import { useChatStore } from '@/stores/chatStore'
import { useFileStore } from '@/stores/fileStore'
import router from '@/router'

const readNumber = (key) => {
  const value = localStorage.getItem(key)
  return value ? Number(value) : null
}

export const useAuthStore = defineStore('auth', () => {
  // state
  const token = ref(localStorage.getItem('token'))
  const userId = ref(readNumber('userId'))
  const username = ref(localStorage.getItem('username'))
  const role = ref(localStorage.getItem('role'))

  // getters
  const isAuthenticated = computed(() => !!token.value)
  // 화면 노출용 판단 (실제 권한 검사는 서버에서 수행)
  const isAdmin = computed(() => role.value === 'ROLE_ADMIN')
  // 내 정보(id/role)가 아직 없는 기존 세션인지 여부
  const needsProfile = computed(() => !!token.value && (userId.value == null || !role.value))

  // actions
  const signin = async (credentials) => {
    // 이전 사용자의 상태가 남지 않도록 초기화
    resetDomainStores()

    setToken(await signinApi(credentials))
    await fetchMe()
  }

  const fetchMe = async () => {
    const myInfo = await getMyInfoApi()

    userId.value = myInfo.id
    username.value = myInfo.username
    role.value = myInfo.role

    localStorage.setItem('userId', String(myInfo.id))
    localStorage.setItem('username', myInfo.username)
    localStorage.setItem('role', myInfo.role)
  }

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUsername = (newUsername) => {
    username.value = newUsername
    localStorage.setItem('username', newUsername)
  }

  const resetDomainStores = () => {
    useChatStore().reset()
    useFileStore().reset()
  }

  // 여러 요청이 동시에 인증 실패해도 안전하도록 멱등하게 동작한다.
  const signout = () => {
    if (token.value) {
      // 서버의 refresh token 쿠키 제거 (실패해도 로컬 로그아웃은 진행)
      signoutApi().catch(() => {})
    }

    resetDomainStores()

    token.value = null
    userId.value = null
    username.value = null
    role.value = null

    for (const key of ['token', 'userId', 'username', 'role']) {
      localStorage.removeItem(key)
    }

    if (router.currentRoute.value.name !== 'signin') {
      router.replace({ name: 'signin' })
    }
  }

  return {
    token,
    userId,
    username,
    role,
    isAuthenticated,
    isAdmin,
    needsProfile,
    signin,
    fetchMe,
    setToken,
    setUsername,
    signout,
  }
})
