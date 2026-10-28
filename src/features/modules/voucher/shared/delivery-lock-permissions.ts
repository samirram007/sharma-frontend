import { FEATURES } from '@/data/features'
import { useAuth } from '@/features/auth/contexts/AuthContext'

/**
 * Roles that bypass feature checks — mirrors
 * App\Http\Middleware\RequireFeaturePermission::SUPERADMIN_ROLE_CODES, so the
 * UI never hides an action the backend would still allow.
 */
const BYPASS_ROLE_CODES = new Set(['SUPER_ADMIN', 'DEVELOPER'])

export type DeliveryLockPermissions = {
  /** See whether a delivery is postponed (locked) or released. */
  canView: boolean
  /** Postpone a delivery / edit its lock reason. */
  canPostpone: boolean
  /** Release a postponed delivery. */
  canRelease: boolean
}

/**
 * Delivery-lock rights of the signed-in user, from the permissions the auth
 * profile carries (Roles & Permissions → DELIVERY_LOCK_*).
 *
 * The backend enforces the same codes on
 * `POST /api/delivery-locks` (POSTPONE / RELEASE) and on the Freight lock
 * routes; these flags only decide what the UI offers.
 */
export function useDeliveryLockPermissions(): DeliveryLockPermissions {
  const { permissions, user } = useAuth()

  const bypass = !!user?.roles?.some(
    (role) => !!role.code && BYPASS_ROLE_CODES.has(role.code),
  )
  const has = (code: string) => bypass || permissions.includes(code)

  return {
    canView: has(FEATURES.DELIVERY_LOCK_VIEW),
    canPostpone: has(FEATURES.DELIVERY_LOCK_POSTPONE),
    canRelease: has(FEATURES.DELIVERY_LOCK_RELEASE),
  }
}
