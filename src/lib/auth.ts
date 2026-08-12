// src/lib/auth.ts

import { redirect } from '@tanstack/react-router'
import type { MyRouterContext } from '@/core/contexts/MyRouterContext'

/**
 * Shared storage key for the bearer token used across auth modules.
 * Re-exported from the consolidated token-storage driver — the constant and
 * the driver selection logic now live together in `./token-storage`.
 */
export { AUTH_TOKEN_KEY } from './token-storage'

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
export function requirePermission(
  permission: string,
  fallback: string = '/forbidden',
) {
  return async ({ context }: { context: MyRouterContext }) => {
    if (!context.auth?.permissions?.includes(permission)) {
      throw redirect({ to: fallback })
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
 * @param permissions - Permission codes to check (e.g. ['DAYBOOK_MENU_VIEW', 'DAYBOOK_SELF_MENU_VIEW'])
 * @param fallback - Optional redirect path when all permissions are missing (default: '/forbidden')
 */
export function requireAnyPermission(
  permissions: string[],
  fallback: string = '/forbidden',
) {
  return async ({ context }: { context: MyRouterContext }) => {
    const hasAny = permissions.some((permission) =>
      context.auth?.permissions?.includes(permission),
    )
    if (!hasAny) {
      throw redirect({ to: fallback })
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
