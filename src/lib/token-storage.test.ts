import { beforeEach, describe, expect, it, vi } from 'vitest'

// jsdom doesn't provide window.localStorage in this environment — install a
// faithful in-memory Storage mock so the driver is exercised end-to-end.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear() {
    this.store.clear()
  }

  getItem(key: string) {
    return this.store.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value))
  }
}

const AUTH_TOKEN_KEY = 'auth_token'

// The driver is read from import.meta.env at module scope, so each driver
// branch is tested by stubbing the env var and re-importing the module fresh.
// Pass '' for the unset case (defaults to localStorage via `|| 'localStorage'`).
async function loadDriver(driver: string) {
  vi.stubEnv('VITE_AUTH_STORAGE', driver)
  vi.resetModules()
  return await import('./token-storage')
}

describe('token-storage driver', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    Object.defineProperty(window, 'localStorage', {
      value: new MemoryStorage(),
      configurable: true,
      writable: true,
    })
    Object.defineProperty(window, 'sessionStorage', {
      value: new MemoryStorage(),
      configurable: true,
      writable: true,
    })
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  })

  it('defaults to localStorage when no driver is configured', async () => {
    const { getToken, setToken, removeToken } = await loadDriver('')

    window.localStorage.setItem(AUTH_TOKEN_KEY, 'abc')
    expect(getToken()).toBe('abc')

    setToken('def')
    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBe('def')

    removeToken()
    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
  })

  it('uses sessionStorage when VITE_AUTH_STORAGE=sessionStorage', async () => {
    const { getToken, setToken, removeToken } =
      await loadDriver('sessionStorage')

    window.sessionStorage.setItem(AUTH_TOKEN_KEY, 'abc')
    expect(getToken()).toBe('abc')

    setToken('def')
    expect(window.sessionStorage.getItem(AUTH_TOKEN_KEY)).toBe('def')
    // localStorage must remain untouched
    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()

    removeToken()
    expect(window.sessionStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
  })

  it('reads from the token cookie when VITE_AUTH_STORAGE=cookie', async () => {
    const { getToken } = await loadDriver('cookie')
    document.cookie = 'token=xyz; path=/'
    expect(getToken()).toBe('xyz')
  })

  it('writes to the token cookie when VITE_AUTH_STORAGE=cookie', async () => {
    const { setToken, getToken } = await loadDriver('cookie')
    setToken('cookie-token')
    expect(getToken()).toBe('cookie-token')
  })

  it('returns null when cookie driver has no token cookie', async () => {
    const { getToken } = await loadDriver('cookie')
    expect(getToken()).toBeNull()
  })

  it('removeToken clears a lingering token cookie', async () => {
    // jsdom purges expired cookies entirely, so assert behaviorally: after
    // removal the cookie driver no longer sees any token.
    const { setToken, getToken, removeToken } = await loadDriver('cookie')
    setToken('stale-token')
    expect(getToken()).toBe('stale-token')

    removeToken()
    expect(getToken()).toBeNull()
  })
})
