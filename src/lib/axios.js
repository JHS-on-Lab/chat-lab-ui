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

    /**
     * access token 만료 → reissue
     */
    if (
      status === 401 && errorCode === 'JWT_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true

      // 이미 reissue 중이면 대기
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
        // refresh token 재발급
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

    if (status === 401) {
      // 로그인 API에서만 발생하는 인증 실패
      if (errorCode === 'AUTH_INVALID_CREDENTIALS') {
        return Promise.reject(error)
      }

      // 그 외 401 → 토큰 문제
      alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
      authStore.signout()
      router.push({ name: 'signin' })
    }

    /**
     * 권한 없음
     */
    if (status === 403) {
      alert('접근 권한이 없습니다.')
    }

    return Promise.reject(error)
  }
)

export default apiClient
