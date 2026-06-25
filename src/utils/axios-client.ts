import axios, {
    AxiosError,
    type AxiosInstance,
    type AxiosResponse,
    type InternalAxiosRequestConfig
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

// Request interceptor (optional if you want to attach tokens manually)
axiosClient.interceptors.request.use(
    (config) => {
        // Optional: attach tokens manually from cookies/localStorage/context
        // const token = getToken()
        // if (token) config.headers.Authorization = `Bearer ${token}`
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
                console.error('❌ Token refresh failed, redirecting to sign-in.')
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
