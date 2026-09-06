import type { QueryClient } from '@tanstack/react-query'
import type { MyRouterContext } from '@/core/contexts/MyRouterContext'
import { setForbiddenRoute } from '@/lib/forbidden-details'
import { MenuQueryOptions } from './queryOptions'
import { menuTreeQueryOptions } from './services'
import type { MenuTreeItem, MenuTreeResponse } from './menu-tree-types'

/**
 * Collect every routable leaf path from a menu tree (any depth).
 * Groups (nodes without a route) are skipped, their children are walked.
 */
export function collectMenuRoutes(tree: MenuTreeItem[]): string[] {
  const routes: string[] = []
  const walk = (nodes: MenuTreeItem[]) => {
    for (const node of nodes) {
      if (node.route) routes.push(node.route)
      // Flat menu lists (e.g. GET /api/menus) omit the children key entirely;
      // only the hierarchical trees include it.
      const children = node.children
      if (Array.isArray(children) && children.length > 0) walk(children)
    }
  }
  walk(tree)
  return routes
}

/**
 * Paths that are always accessible to any authenticated user, regardless of
 * menu permissions. These routes only require authentication, not specific
 * role/permission grants.
 */
const ALWAYS_ALLOWED_PATHS: readonly string[] = [
  '/help-center',
  '/faqs',
  '/documents',
  '/tickets',
]

/**
 * Decide whether a router path must be blocked.
 *
 * A path is menu-controlled when it equals a menu route or lives under one
 * (e.g. `/transactions/freight/123` is covered by `/transactions/freight`).
 * Menu-controlled paths are blocked when that menu route is absent from the
 * user's *visible* tree — the backend already filters the visible tree by
 * role permission AND `is_visible`, so this covers both cases.
 *
 * Paths in the ALWAYS_ALLOWED_PATHS list are never blocked — they only
 * require the user to be authenticated.
 */
/**
 * Unit-test surface: expose the raw matching logic so tests can verify
 * the most-specific-route preference without needing the full guard.
 */
export function matchMostSpecificRoute(
  normalized: string,
  allRoutes: string[],
): string {
  let best = ''
  for (const route of allRoutes) {
    if (
      normalized === route ||
      (route !== '/' && normalized.startsWith(`${route}/`))
    ) {
      if (route.length > best.length) best = route
    }
  }
  return best
}

export function isBlockedMenuPath(
  pathname: string,
  allMenuRoutes: string[],
  visibleMenuRoutes: string[],
): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/'

  // Always-allowed paths bypass the menu permission check.
  if (
    ALWAYS_ALLOWED_PATHS.some(
      (p) => normalized === p || normalized.startsWith(`${p}/`),
    )
  ) {
    return false
  }

  // Find the *most specific* (longest) matching menu route so that
  // `/transactions/vouchers/delivery_note` wins over the parent
  // `/transactions/vouchers` when both exist in the tree.
  let bestMatch = ''
  for (const route of allMenuRoutes) {
    if (
      normalized === route ||
      // A root "/" menu entry must only match itself — as a prefix it would
      // blanket-match every path and disable the guard entirely.
      (route !== '/' && normalized.startsWith(`${route}/`))
    ) {
      if (route.length > bestMatch.length) {
        bestMatch = route
      }
    }
  }
  if (!bestMatch) return false

  return !visibleMenuRoutes.includes(bestMatch)
}

/** Find the menu entry whose route owns `pathname` (leaf or ancestor).
 * When several routes match (e.g. a parent group and a child leaf), the
 * most specific (longest) route is returned so the per-page permission
 * code is reported rather than the parent group's.
 */
function findMenuEntryForPath(
  nodes: MenuTreeItem[],
  normalized: string,
): MenuTreeItem | null {
  let best: MenuTreeItem | null = null
  let bestLen = 0
  for (const node of nodes) {
    if (
      node.route &&
      (normalized === node.route ||
        (node.route !== '/' && normalized.startsWith(`${node.route}/`)))
    ) {
      if (node.route.length > bestLen) {
        best = node
        bestLen = node.route.length
      }
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      const found = findMenuEntryForPath(node.children, normalized)
      if (found && found.route && found.route.length > bestLen) {
        best = found
        bestLen = found.route.length
      }
    }
  }
  return best
}

/** Tolerate the different serialisations of the feature code across endpoints. */
function featureCodeOf(node: MenuTreeItem): string | null {
  if (node.featureCode) return node.featureCode
  const loose = node as unknown as {
    feature_code?: string | null
    feature?: { code?: string | null } | null
  }
  return loose.feature_code ?? loose.feature?.code ?? null
}

/**
 * Route guard used by the protected layout: blocks navigation to menu routes
 * that are absent from the user's visible menu tree.
 *
 * The visible tree (`/auth/menus`) is already filtered server-side by the
 * user's role permissions AND the menu `is_visible` flag, so this single
 * check enforces both "denied permission" and "hidden from UI".
 *
 * A blocked navigation does NOT redirect: the URL keeps showing the path the
 * user tried to open and the protected layout renders the 403 content in the
 * page area instead (see `ForbiddenGate`).
 */
export async function guardMenuRoutes(
  context: MyRouterContext,
  pathname: string,
  /** 'preload' when running for a link preload, not an actual navigation. */
  cause?: 'preload' | 'enter' | 'stay',
): Promise<void> {
  // Link preloads also run beforeLoad — they must never touch the visible
  // block state of the page the user is currently on.
  if (cause === 'preload') return

  const queryClient: QueryClient = context.queryClient

  // Full menu list — the set of paths that are menu-controlled.
  const allMenus = await queryClient.ensureQueryData(MenuQueryOptions())
  const allRoutes = collectMenuRoutes(
    (allMenus?.data ?? []) as unknown as MenuTreeItem[],
  )
  if (allRoutes.length === 0) return

  // Visible (permission + is_visible filtered) tree for the current user.
  const visible = await queryClient.ensureQueryData(menuTreeQueryOptions())
  const visibleRoutes = collectMenuRoutes(
    ((visible as MenuTreeResponse | undefined)?.data ?? []) as MenuTreeItem[],
  )

  if (isBlockedMenuPath(pathname, allRoutes, visibleRoutes)) {
    const normalized = pathname.replace(/\/+$/, '') || '/'
    const blockedNode = findMenuEntryForPath(
      (allMenus?.data ?? []) as unknown as MenuTreeItem[],
      normalized,
    )
    const permissionCode = blockedNode ? featureCodeOf(blockedNode) : null

    setForbiddenRoute({
      attemptedPath: normalized,
      pageName: blockedNode?.menuName ?? undefined,
      permissionCodes: permissionCode ? [permissionCode] : undefined,
    })
  }
}
