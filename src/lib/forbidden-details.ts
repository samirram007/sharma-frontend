/**
 * Hand-off between the route guards and the in-place "Access Denied" content.
 *
 * Guards never redirect to /forbidden any more: the URL keeps showing the
 * page the user tried to open, and the protected layout renders the 403
 * content where the page would have been. The guards simply record what they
 * know (the requested path, the page name and the permission code(s) that
 * grant access) in this module-level store; the layout reads it reactively.
 *
 * The store is cleared per navigation by the layout gate (see
 * `ForbiddenGate`), so a later visit never shows stale details.
 */

export interface ForbiddenDetails {
  /** The path the user tried to open before being blocked. */
  attemptedPath?: string
  /** Human page/menu name, e.g. "Department". */
  pageName?: string
  /** Feature/permission code(s) that grant access, e.g. "DEPARTMENT_MENU_VIEW". */
  permissionCodes?: string[]
}

let current: ForbiddenDetails | null = null
const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => listener())
}

/**
 * Record that the route currently being opened is forbidden. The protected
 * layout swaps the page content for the 403 screen while the URL keeps
 * showing `attemptedPath`.
 */
export function setForbiddenRoute(details: ForbiddenDetails): void {
  current = details
  notify()
}

/**
 * Clear the blocked-route flag — the layout gate calls this whenever the
 * router navigates to a different pathname, so only the actually blocked
 * navigation renders the 403 content.
 */
export function clearForbiddenRoute(): void {
  if (current === null) return
  current = null
  notify()
}

export function getForbiddenRoute(): ForbiddenDetails | null {
  return current
}

export function subscribeForbiddenRoute(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** True when the current navigation was blocked by a route guard. */
export function isForbiddenRoute(pathname: string): boolean {
  return current?.attemptedPath !== undefined && current.attemptedPath !== null
    ? normalizePath(current.attemptedPath) === normalizePath(pathname)
    : current !== null
}

/**
 * Turn a permission code into a human-friendly name.
 * "DEPARTMENT_MENU_VIEW" → "Department Menu View"
 */
export function permissionLabel(code: string): string {
  return code.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}
