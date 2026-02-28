import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signin as signinApi } from '@/api/authApi'
import { getMyInfo } from '@/services/userService'

export const useAuthStore = defineStore('auth', () => {
  // state
  const token = ref(localStorage.getItem('token'))
  const username = ref(localStorage.getItem('username'))

  // getters
  const isAuthenticated = computed(() => !!token.value)

  // actions
  const signin = async (credentials) => {
try {
    const accessToken = await signinApi(credentials)

    token.value = accessToken
    localStorage.setItem('token', token.value)

    await fetchMe()
    } catch (error) {
      throw error.response
    }
  }

   const fetchMe = async () => {
    const myInfo = await getMyInfo()
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
