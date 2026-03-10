import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signin as signinApi } from '@/api/authApi'
import { getMyInfo as getMyInfoApi } from '@/api/userApi'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // state
  const token = ref(localStorage.getItem('token'))
  const username = ref(localStorage.getItem('username'))

  // getters
  const isAuthenticated = computed(() => !!token.value)

  // actions
  const signin = async (credentials) => {
    const accessToken = await signinApi(credentials)
    token.value = accessToken
    localStorage.setItem('token', token.value)
    await fetchMe()
  }

  const fetchMe = async () => {
    const myInfo = await getMyInfoApi()
    username.value = myInfo.username
    localStorage.setItem('username', username.value)
  }

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUsername = (newUsername) => {
    username.value = newUsername
    localStorage.setItem('username', newUsername)
  }

  const signout = () => {
    token.value = null
    username.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('username')

    router.replace('/signin')
  }

  return {
    token,
    username,
    isAuthenticated,
    signin,
    fetchMe,
    setToken,
    setUsername,
    signout,
  }
})
