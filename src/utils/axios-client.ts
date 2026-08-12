import type { AxiosError } from 'axios'
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { API_BASE_URL } from '@/lib/env'
import { getToken, removeToken } from '@/lib/token-storage'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Create Axios instance
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // headers: {
  //     'Content-Type': 'application/json',
  // },
})

// Refresh token handler
async function refreshToken(): Promise<void> {
  try {
    await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    )
  } catch (error) {
    console.error('🔁 Token refresh failed:', error)
    throw error
  }
}

axiosClient.interceptors.request.use(
  (config) => {
    // Attach bearer token from whatever storage VITE_AUTH_STORAGE configures
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const status = error.response?.status

    const isAuthRoute =
      window.location.pathname.includes('/sign-in') ||
      originalRequest.url?.includes('/auth/refresh')

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true
      try {
        await refreshToken()
        return axiosClient(originalRequest)
      } catch (refreshError) {
        console.error(
          '❌ Token refresh failed, clearing token and redirecting to sign-in.',
        )
        // Clear stale token from whatever storage VITE_AUTH_STORAGE configured
        removeToken()
        window.location.href = '/sign-in'
        return Promise.reject(refreshError)
      }
    }

    // Handle known errors
    const messages: Record<number, string> = {
      400: '❗ Bad Request',
      403: '⛔ Forbidden',
      404: '❓ Not Found..',
      422: '⚠️ Validation Failed',
      500: '💥 Server Error',
    }

    if (status && messages[status]) {
      console.warn(`[Error ${status}] ${messages[status]}`)
      // Optionally show toast here
    }

    return Promise.reject(error)
  },
)

export default axiosClient
