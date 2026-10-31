// src/context/AuthContext.tsx
import type { UserFiscalYear } from '@/features/modules/user_fiscal_year/data/schema'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  fetchUserProfileService,
  loginService,
  logoutService,
} from '../services/apis'
import type { UserWithRole } from '../data/schema'
import type { Permission } from '@/features/modules/permission/data/schema'
import type { Role } from '@/features/modules/role/data/schema'
import type { MenuTreeItem } from '@/features/modules/menu/data/menu-tree-types'
import { menuTreeQueryOptions } from '@/features/modules/menu/data/services'
export type LoginProps = {
  email: string
  password: string
}

export type PeriodType = {
  startDate: Date | null
  endDate: Date | null
}
export interface AuthContextType {
  user: UserWithRole | null
  userFiscalYear: UserFiscalYear | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (props: LoginProps) => Promise<void>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
  /**
   * Re-read the profile and recompute `permissions` without the global
   * loading state — used after a role-permission change so a granted or
   * revoked feature takes effect immediately instead of after a re-login.
   */
  refreshPermissions: () => Promise<void>
  permissions: string[]
  menuTree: MenuTreeItem[]
  period: PeriodType | null
  setPeriod: (period: PeriodType | null) => void
}

// ---------------------------------------------------------------------------
//  Token storage helpers — driven by VITE_AUTH_STORAGE env var
//  Consolidated in src/lib/token-storage.ts (shared with the axios client)
// ---------------------------------------------------------------------------
import { getToken, setToken, removeToken } from '@/lib/token-storage'
import { refreshToken } from '@/utils/axios-client'

export { getToken, setToken, removeToken }

/**
 * Allowed feature codes across the user's roles, used for every
 * `permissions.includes(...)` gate in the app.
 */
function collectPermissions(roles?: Role[] | null): string[] {
  const perms: string[] = []

  roles?.forEach((role) => {
    role?.permissions?.forEach((permission: Permission) => {
      const code = permission.appModuleFeature?.code
      if (permission.isAllowed && code && !perms.includes(code)) {
        perms.push(code)
      }
    })
  })

  return perms
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // const navigate = useNavigate();
  // const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [userFiscalYear, setUserFiscalYear] = useState<UserFiscalYear | null>(
    null,
  )
  const [period, setPeriod] = useState<PeriodType | null>(null)
  const [permissions, setpermissions] = useState<string[]>([])
  const [menuTree, setMenuTree] = useState<MenuTreeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

  // Fetch the menu tree via TanStack Query
  const { data: menuTreeData } = useQuery({
    ...menuTreeQueryOptions(),
    enabled: !!user, // only fetch once we have a user
  })

  // Sync menu tree data into context state
  useEffect(() => {
    if (menuTreeData?.data) {
      setMenuTree(menuTreeData.data)
    }
  }, [menuTreeData])

  /**
   * The httpOnly `token` cookie authenticates every /api call but is
   * invisible to JS, so a tab whose readable storage is empty — a new tab when
   * VITE_AUTH_STORAGE is per-tab sessionStorage, cleared storage, or the
   * `cookie` driver — is logged in yet has no bearer token for anything that
   * reads `getToken()` (Echo channel auth, the axios 401 retry). Minting one
   * from the cookie keeps every tab in the same readable state.
   */
  const ensureReadableToken = async () => {
    if (getToken()) return

    try {
      await refreshToken()
    } catch {
      // No cookie-backed session to mint from (anonymous visitor). The profile
      // call that preceded this already failed and cleared the user.
    }
  }

  const fetchProfile = async () => {
    setIsLoading(true)
    // check cookie key "token" is set  else redirect to login

    try {
      // console.log('Fetching profile...');
      const data = await fetchUserProfileService()
      flushSync(() => {
        setUser(data?.data)
        setUserFiscalYear(data?.data?.userFiscalYear || null)

        setPeriod(
          data?.data?.userFiscalYear
            ? {
                startDate: new Date(data?.data?.userFiscalYear.startDate),
                endDate: new Date(data?.data?.userFiscalYear.endDate),
              }
            : null,
        )
        // Extract permissions from roles
        setpermissions(collectPermissions(data?.data?.roles))
      })
      // Authenticated by cookie only? Give this tab a token of its own before
      // anything downstream needs one.
      await ensureReadableToken()
      // console.log('Profile fetched successfully:', data?.data);

      // console.log('profile Data: ', data, isAuthenticated, user);
    } catch {
      flushSync(() => {
        setUser(null)
        setUserFiscalYear(null)
      })
      // Token is invalid/expired — clear it from storage
      removeToken()
    } finally {
      // console.log('Profile fetch completed');

      setIsLoading(false)
    }
  }
  /**
   * Refresh `permissions` in place (no loading spinner): after a permission is
   * granted or revoked the current session must follow immediately, otherwise
   * a user keeps the stale rights captured at login.
   */
  const refreshPermissions = React.useCallback(async () => {
    try {
      const data = await fetchUserProfileService()
      const profile = data?.data
      if (profile) {
        setUser(profile)
        setpermissions(collectPermissions(profile.roles))
      }
    } catch {
      // Keep the current snapshot — a failed refresh must not drop rights.
    }
  }, [])

  const login = React.useCallback(async ({ email, password }: LoginProps) => {
    setIsLoading(true)
    try {
      const response = await loginService({ email, password })
      // Backend returns the unified envelope: success (boolean).
      // Keep the legacy 'status' check for backward compatibility.
      if (response?.success === true || response?.status === 'success') {
        // Store bearer token if the backend returned one
        if (response?.token) {
          setToken(response.token)
        }
        await fetchProfile()
      } else {
        flushSync(() => {
          setUser(null)
          setUserFiscalYear(null)
        })
      }
    } finally {
      // Always reset loading state, even if loginService throws
      setIsLoading(false)
    }
  }, [])

  const logout = React.useCallback(async () => {
    console.log('Logging out...')
    setIsLoading(true)
    try {
      await logoutService()

      flushSync(() => {
        queryClient.clear()
        setUser(null)
        // Clear stored bearer token
        removeToken()
      })
    } catch (error) {
      console.error('Logout failed:', error)
      // Still clear local state even if server call fails
      removeToken()
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [])
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        userFiscalYear,
        period,
        setPeriod,
        isAuthenticated: !!user,
        login,
        logout,
        fetchProfile,
        refreshPermissions,
        permissions,
        menuTree,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
