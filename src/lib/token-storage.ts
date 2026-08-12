/**
 * Token storage driver — the single source of truth for where the bearer
 * token lives. Used by the axios interceptor (module scope, no React) and by
 * AuthContext, so the driver selection + read/write/remove logic exists once
 * instead of being duplicated in both places.
 *
 * The driver is configured via `VITE_AUTH_STORAGE`:
 *   - `localStorage`   (default)
 *   - `sessionStorage`
 *   - `cookie`         — relies on the server-set (httpOnly) cookie
 */

/** Shared storage key for the bearer token used across auth modules. */
export const AUTH_TOKEN_KEY = 'auth_token'

/** Configured storage driver: localStorage, sessionStorage, or 'cookie'. */
const authDriver = import.meta.env.VITE_AUTH_STORAGE || 'localStorage'

function getStorage(): Storage | null {
  if (authDriver === 'sessionStorage') return sessionStorage
  if (authDriver === 'localStorage') return localStorage
  return null // 'cookie' or unknown — no web storage, rely on HTTP-only cookie
}

/** Read the bearer token from whichever storage VITE_AUTH_STORAGE configures. */
export function getToken(): string | null {
  const store = getStorage()
  if (store) return store.getItem(AUTH_TOKEN_KEY)
  // Cookie-based storage: try reading the 'token' cookie.
  // NOTE: httpOnly cookies set by the server are NOT readable from
  // document.cookie — this path only works with non-httpOnly cookies.
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'))
  return match ? match[2] : null
}

/** Persist the bearer token in whichever storage VITE_AUTH_STORAGE configures. */
export function setToken(token: string): void {
  const store = getStorage()
  if (store) {
    store.setItem(AUTH_TOKEN_KEY, token)
  } else {
    // Fallback to cookie if no web storage is configured
    document.cookie = `token=${token}; path=/; secure; SameSite=None`
  }
}

/**
 * Remove the bearer token from the configured driver and also clear any
 * lingering `token` cookie (a stale cookie would otherwise keep being sent
 * with credentials on subsequent requests).
 */
export function removeToken(): void {
  const store = getStorage()
  if (store) {
    store.removeItem(AUTH_TOKEN_KEY)
  }
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}
