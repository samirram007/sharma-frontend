// src/lib/auth.ts

import { redirect } from '@tanstack/react-router'
import type { MyRouterContext } from '@/core/contexts/MyRouterContext'

/**
 * Shared storage key for the bearer token used across auth modules.
 * Both AuthContext and the axios interceptor read/write from this key.
 * Keep in sync if changed — circular deps prevent a direct import.
 */
export const AUTH_TOKEN_KEY = 'auth_token'

/**
 * Creates a reusable TanStack Router `beforeLoad` guard that checks if the
 * authenticated user has the given permission.
 *
 * @param permission - The permission code to check (e.g. 'USER_MENU_VIEW')
 * @param fallback - Optional redirect path when permission is missing (default: '/')
 *
 * @example
 * // In a route file:
 * beforeLoad: requirePermission('USER_MENU_VIEW')
 */
export function requirePermission(permission: string, fallback: string = '/forbidden') {
  return async ({ context }: { context: MyRouterContext }) => {
    if (!context.auth?.permissions?.includes(permission)) {
      throw redirect({ to: fallback })
    }
  }
}