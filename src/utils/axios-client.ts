import type { AxiosError } from 'axios'
import axios, {
    type AxiosInstance,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

// Create Axios instance
const axiosClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    // baseURL: '/api',
    withCredentials: true,
    // headers: {
    //     'Content-Type': 'application/json',
    // },
})

// Refresh token handler
async function refreshToken(): Promise<void> {
    try {
        await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
        )
    } catch (error) {
        console.error('🔁 Token refresh failed:', error)
        throw error
    }
}

// Keep in sync with AUTH_TOKEN_KEY exported from @/lib/auth — circular deps
// prevent a direct import from this module.
const STORAGE_KEY = 'auth_token'

/** Read the bearer token from whichever storage VITE_AUTH_STORAGE configures */
function getStoredToken(): string | null {
    const driver = import.meta.env.VITE_AUTH_STORAGE || 'localStorage'
    if (driver === 'sessionStorage') return sessionStorage.getItem(STORAGE_KEY)
    if (driver === 'localStorage')   return localStorage.getItem(STORAGE_KEY)
    // Cookie fallback — NOTE: httpOnly cookies set by the server are not
    // readable from document.cookie, so this path only works with non-httpOnly cookies.
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'))
    return match ? match[2] : null
}

axiosClient.interceptors.request.use(
    (config) => {
        // Attach bearer token from VITE_AUTH_STORAGE when available
        const token = getStoredToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config
    },
    (error) => Promise.reject(error)
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
                console.error('❌ Token refresh failed, clearing token and redirecting to sign-in.')
                // Clear stale token from whatever storage VITE_AUTH_STORAGE configured
                const driver = import.meta.env.VITE_AUTH_STORAGE || 'localStorage'
                if (driver === 'sessionStorage') sessionStorage.removeItem(STORAGE_KEY)
                else if (driver === 'localStorage') localStorage.removeItem(STORAGE_KEY)
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
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
    }
)

export default axiosClient
