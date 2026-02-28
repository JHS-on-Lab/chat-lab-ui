import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import router from '@/router'

/**
 * reissue 중복 방지용 상태
 */
let isRefreshing = false
let refreshSubscribers = []

function onRefreshed(newAccessToken) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken))
  refreshSubscribers = []
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback)
}

/**
 * axios instance
 */
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true, // refresh token cookie 필수
})

/**
 * request interceptor - access token 을 authorization header 에 포함
 */
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }

  return config
})

/**
 * response interceptor - access token 만료 시 reissue + retry
 */
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const authStore = useAuthStore()

    if (!error.response) {
      return Promise.reject(error)
    }

    const { status, data } = error.response
    // const message = data?.message
    const errorCode = data?.errorCode
    const originalRequest = error.config

    if (!errorCode) {
      return Promise.reject(error)
    }

    /* JWT 처리 */
    if (errorCode === 'JWT_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const response = await apiClient.post('/auth/reissue')
        const newToken = response.data.data

        authStore.setToken(newToken)
        onRefreshed(newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return apiClient(originalRequest)

      } catch (reissueError) {
        authStore.signout()
        router.push({ name: 'signin' })
        return Promise.reject(reissueError)
      } finally {
        isRefreshing = false
      }
    }

    if (errorCode.startsWith('JWT_')) {
      authStore.signout()
      router.push({ name: 'signin' })
      return Promise.reject(error.response.data)
    }

    /* AUTH 도메인 */
    if (errorCode.startsWith('AUTH_')) {
      return Promise.reject(error.response.data)
    }

    /* USER 도메인 */
    if (errorCode.startsWith('USER_')) {
      return Promise.reject(error.response.data)
    }

    /* CHATROOM 도메인 */
    if (errorCode.startsWith('CHATROOM_')) {
      return Promise.reject(error.response.data)
    }

    return Promise.reject(error)
  }
)

export default apiClient
