import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

/**
 * reissue 중복 방지용 상태
 * - 재발급 중에 들어온 요청은 큐에 대기했다가 성공 시 재시도, 실패 시 함께 reject 한다.
 */
let refreshPromise = null

/**
 * axios instance
 */
const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // refresh token cookie 필수
})

/**
 * 모든 API 에러를 { status, errorCode, message } 형태로 통일한다.
 */
const normalizeError = (error) => {
  const data = error.response?.data
  return {
    status: error.response?.status ?? null,
    errorCode: data?.errorCode ?? null,
    message: data?.message ?? error.message ?? '요청 처리 중 오류가 발생했습니다.',
  }
}

/**
 * Refresh Token 으로 Access Token 재발급. 동시에 여러 요청이 만료되어도 재발급은 한 번만 수행한다.
 */
export const refreshAccessToken = () => {
  if (!refreshPromise) {
    const authStore = useAuthStore()

    refreshPromise = apiClient
      .post('/auth/reissue', null, { _skipAuthRefresh: true })
      .then(({ data }) => {
        authStore.setToken(data.data)
        return data.data
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

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
 * response interceptor - access token 만료 시 reissue + retry, 그 외 JWT 오류는 로그아웃
 */
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config ?? {}
    const errorCode = error.response?.data?.errorCode

    // 인증 갱신 대상이 아닌 요청(재발급/로그아웃 자체)은 그대로 실패 처리
    if (originalRequest._skipAuthRefresh || !errorCode?.startsWith('JWT_')) {
      return Promise.reject(normalizeError(error))
    }

    const authStore = useAuthStore()

    if (errorCode === 'JWT_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (reissueError) {
        authStore.signout()
        return Promise.reject(reissueError)
      }
    }

    authStore.signout()
    return Promise.reject(normalizeError(error))
  }
)

export default apiClient
