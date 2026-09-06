// src/lib/auth.ts

import type { MyRouterContext } from '@/core/contexts/MyRouterContext'
import {
  setForbiddenRoute,
  type ForbiddenDetails,
} from './forbidden-details'

/**
 * Shared storage key for the bearer token used across auth modules.
 * Re-exported from the consolidated token-storage driver — the constant and
 * the driver selection logic now live together in `./token-storage`.
 */
export { AUTH_TOKEN_KEY } from './token-storage'

/** Shape of the location the router hands to a `beforeLoad` guard. */
interface GuardInput {
  context: MyRouterContext
  location?: { pathname?: string }
  /** 'preload' when the guard runs for a hover/link preload, not navigation. */
  cause?: 'preload' | 'enter' | 'stay'
}

/**
 * Creates a reusable TanStack Router `beforeLoad` guard that checks if the
 * authenticated user has the given permission.
 *
 * When the permission is missing the navigation is blocked in place — the URL
 * keeps showing the requested path and the protected layout renders the 403
 * content instead of the page (no redirect to /forbidden).
 *
 * @param permission - The permission code to check (e.g. 'USER_MENU_VIEW')
 * @param _fallback - Unused; kept so existing call sites keep compiling.
 *
 * @example
 * // In a route file:
 * beforeLoad: requirePermission('USER_MENU_VIEW')
 */
export function requirePermission(
  permission: string,
  _fallback: string = '/forbidden',
) {
  return async ({ context, location, cause }: GuardInput) => {
    // Link preloads also run beforeLoad — they must never touch the visible
    // block state of the page the user is currently on.
    if (cause === 'preload') return
    if (!context.auth?.permissions?.includes(permission)) {
      setForbiddenRoute({
        attemptedPath: location?.pathname,
        permissionCodes: [permission],
      } satisfies ForbiddenDetails)
    }
  }
}

/**
 * Creates a reusable TanStack Router `beforeLoad` guard that checks if the
 * authenticated user has ANY of the given permissions.
 *
 * Use for layout routes that aggregate several permission-gated pages
 * (e.g. `/reports/freight/_layout` hosts both DELIVERY_NOTE_REPORT_MENU_VIEW
 * and FREIGHT_REPORT_MENU_VIEW pages).
 *
 * When none of the permissions are present the navigation is blocked in place
 * (no redirect — the 403 content renders on the requested URL).
 *
 * @param permissions - Permission codes to check (e.g. ['DAYBOOK_MENU_VIEW', 'DAYBOOK_SELF_MENU_VIEW'])
 * @param _fallback - Unused; kept so existing call sites keep compiling.
 */
export function requireAnyPermission(
  permissions: string[],
  _fallback: string = '/forbidden',
) {
  return async ({ context, location, cause }: GuardInput) => {
    if (cause === 'preload') return
    const hasAny = permissions.some((permission) =>
      context.auth?.permissions?.includes(permission),
    )
    if (!hasAny) {
      setForbiddenRoute({
        attemptedPath: location?.pathname,
        permissionCodes: permissions,
      } satisfies ForbiddenDetails)
    }
  }
}

/**
 * Creates a TanStack Router `beforeLoad` guard that only lets users holding a
 * specific role code through (e.g. 'DEVELOPER'). Everyone else gets the 403
 * content rendered in place on the requested URL. Role codes match the
 * backend `RoleSeeder` (sharma-api/app/Modules/Role).
 */
export function requireRole(
  roleCode: string,
  _fallback: string = '/forbidden',
  pageName?: string,
) {
  return async ({ context, location, cause }: GuardInput) => {
    if (cause === 'preload') return
    const codes =
      context.auth?.user?.roles
        ?.map((role) => role.code)
        .filter((code): code is string => Boolean(code)) ?? []
    if (!codes.includes(roleCode)) {
      setForbiddenRoute({
        attemptedPath: location?.pathname,
        pageName,
        permissionCodes: [roleCode],
      } satisfies ForbiddenDetails)
    }
  }
}

/**
 * Role codes allowed to create or edit opening stock vouchers.
 *
 * Opening stock is a one-time-per-fiscal-year setup entry: only super admin /
 * admin / developer roles may create or edit it. Everyone else is view-only.
 * Codes match the backend `RoleSeeder` (sharma-api/app/Modules/Role).
 */
export const OPENING_STOCK_EDITOR_ROLE_CODES = [
  'SUPER_ADMIN',
  'ADMIN',
  'DEVELOPER',
] as const

export type OpeningStockEditorRoleCode =
  (typeof OPENING_STOCK_EDITOR_ROLE_CODES)[number]

const OPENING_STOCK_EDITOR_ROLE_SET = new Set<string>(
  OPENING_STOCK_EDITOR_ROLE_CODES,
)

/**
 * Returns true when any of the user's roles may create or edit opening stock.
 * Accepts the roles array from the auth profile (e.g. `user.roles`).
 */
export function canEditOpeningStock(
  roles?: Array<{ code?: string | null }> | null,
): boolean {
  return (
    roles?.some(
      (role) =>
        role.code != null && OPENING_STOCK_EDITOR_ROLE_SET.has(role.code),
    ) ?? false
  )
}
