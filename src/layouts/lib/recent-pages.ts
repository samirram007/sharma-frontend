const STORAGE_KEY = 'recent-pages-v1'
// Pool of visited pages kept in storage — larger than the number of tabs the
// strip can show at once, so older tabs keep living behind the overflow
// "show more" entry instead of being silently dropped.
const MAX_RECENT = 20

export interface RecentPage {
  title: string
  href: string
  /** User-pinned via the tab context menu — pinned tabs lead the tab strip. */
  pinned?: boolean
}

/** Read the most-recently-visited pages (oldest first is not guaranteed). */
export function readRecentPages(): RecentPage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as RecentPage[]) : []
  } catch {
    return []
  }
}

/** The pinned home tab — always shown first in the tab strip by default. */
export const DEFAULT_TAB: RecentPage = {
  title: 'Dashboard',
  href: '/dashboard',
}

/**
 * Strip trailing slashes so '/foo/' and '/foo' are the same page. The root
 * path '/' is left untouched — it is special-cased by {@link canonicalHref}.
 */
export function stripTrailingSlash(href: string): string {
  return href.length > 1 ? href.replace(/\/+$/, '') : href
}

/**
 * Canonical identity of a route — the key tabs are deduped by.
 * - Trailing slashes are removed ('/transactions/vouchers/' →
 *   '/transactions/vouchers').
 * - The root '/' is the same page as the pinned home '/dashboard' (the app
 *   redirects '/' → '/dashboard'), so both canonicalize to '/dashboard'.
 */
export function canonicalHref(href: string): string {
  const normalized = stripTrailingSlash(href)
  return normalized === '/' ? DEFAULT_TAB.href : normalized
}

/** True when a route is the pinned home page under any of its aliases. */
export function isHomeHref(href: string): boolean {
  return canonicalHref(href) === DEFAULT_TAB.href
}

/**
 * Always-allowed pages that live outside the DB menu tree. The tab strip
 * records visits by looking up the menu title; these routes have no menu
 * entry, so without a title fallback they would never appear as tabs.
 * Must mirror ALWAYS_ALLOWED_PATHS in menu-route-guard.ts.
 */
const STATIC_PAGE_TITLES: Readonly<Record<string, string>> = {
  '/documents': 'Documents',
  '/tickets': 'Support Tickets',
  '/help-center': 'Help Center',
  '/faqs': 'FAQs',
  '/profile': 'Profile',
  '/change-password': 'Change Password',
}

/**
 * Title for the tab strip: menu label first, then the static-page map, then
 * a prettified last URL segment so rarely-visited pages still get a tab.
 */
export function pageTitleForRoute(
  nodes: Parameters<typeof findMenuTitleByRoute>[0],
  route: string,
): string | null {
  const fromMenu = findMenuTitleByRoute(nodes, route)
  if (fromMenu) return fromMenu
  const canonical = canonicalHref(route)
  if (STATIC_PAGE_TITLES[canonical]) return STATIC_PAGE_TITLES[canonical]
  const segment = canonical.split('/').filter(Boolean).pop()
  return segment
    ? segment.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
    : null
}

/**
 * Paths that must never become tabs. The blocked-route flow renders the 403
 * content on the blocked URL itself (no redirect), so '/forbidden' is only
 * reached via the standalone demo page — it is not a page the user works in.
 * Older entries recorded before this rule are purged while reading storage.
 */
const NEVER_TAB_PATHS: ReadonlySet<string> = new Set(['/forbidden'])

/** True when the route must never appear as a tab in the strip. */
export function isNeverTabPath(href: string): boolean {
  return NEVER_TAB_PATHS.has(canonicalHref(href))
}

const LAST_FOLDER_STORAGE_KEY = 'documents-last-folder-v1'

/** Persist the last browsed documents folder (per browser). */
export function saveLastDocumentsFolder(folderId: number | null): void {
  try {
    if (folderId === null) {
      localStorage.removeItem(LAST_FOLDER_STORAGE_KEY)
    } else {
      localStorage.setItem(LAST_FOLDER_STORAGE_KEY, String(folderId))
    }
  } catch {
    // storage unavailable — restore simply won't work
  }
}

/** Last browsed documents folder, or null when none/corrupted. */
export function readLastDocumentsFolder(): number | null {
  try {
    const raw = localStorage.getItem(LAST_FOLDER_STORAGE_KEY)
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  } catch {
    return null
  }
}

/**
 * True when the Documents tab is still open in the tab strip — pages whose
 * tab was closed lose their "remember last folder" state.
 */
export function isDocumentsTabOpen(): boolean {
  return readTabs().some((page) => canonicalHref(page.href) === '/documents')
}

/**
 * The canonical route of the tab that owns `pathname` — exact match first,
 * otherwise the longest route it lives under (e.g. a voucher record at
 * '/transactions/vouchers/delivery_note/7045' belongs to the
 * '/transactions/vouchers/delivery_note' tab). Returns null when no tab
 * covers the path, so record detail pages never spawn tabs of their own.
 */
export function tabHrefForPath(
  hrefs: string[],
  pathname: string,
): string | null {
  const target = canonicalHref(pathname)
  let best: string | null = null
  let bestLength = -1
  for (const href of hrefs) {
    const route = canonicalHref(href)
    if (route === target || target.startsWith(`${route}/`)) {
      if (route.length > bestLength) {
        best = route
        bestLength = route.length
      }
    }
  }
  return best
}

/**
 * Record a page visit.
 * - Re-visiting a page keeps its current tab position (tabs must not reorder
 *   when they become active).
 * - A brand-new page becomes a tab inserted right after the previously active
 *   tab (`afterHref`), or at the end when there is no previous tab.
 * - Tabs are keyed by canonical URL, so aliases (trailing slashes, the
 *   '/' → '/dashboard' home redirect) can never produce duplicate tabs.
 * - The home page is never recorded: it is always pinned as the first tab.
 */
export function pushRecentPage(page: RecentPage, afterHref?: string): void {
  try {
    const entry: RecentPage = {
      title: page.title,
      href: canonicalHref(page.href),
      pinned: page.pinned ?? false,
    }
    if (isHomeHref(entry.href)) return
    if (NEVER_TAB_PATHS.has(entry.href)) return

    const existing = readRecentPages()
    if (existing.some((p) => canonicalHref(p.href) === entry.href)) return

    let next: RecentPage[]
    if (afterHref && isHomeHref(afterHref)) {
      // Opened from the pinned home tab — goes right after it, i.e. first.
      next = [entry, ...existing]
    } else if (afterHref) {
      const afterIndex = exactOrPrefixIndex(existing, afterHref)
      next =
        afterIndex >= 0
          ? [
              ...existing.slice(0, afterIndex + 1),
              entry,
              ...existing.slice(afterIndex + 1),
            ]
          : [...existing, entry]
    } else {
      next = [...existing, entry]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimToCap(next)))
  } catch {
    // storage unavailable (private mode etc.) — recents simply don't persist
  }
}

/**
 * Index in `existing` after which a tab opened from `href` belongs: the tab
 * whose canonical route exactly matches, else the longest menu route `href`
 * lives under (a nested page shares its section's tab).
 */
function exactOrPrefixIndex(existing: RecentPage[], href: string): number {
  const target = canonicalHref(href)
  const exact = existing.findIndex((p) => canonicalHref(p.href) === target)
  if (exact >= 0) return exact
  let best = -1
  let bestLength = -1
  existing.forEach((page, i) => {
    const route = canonicalHref(page.href)
    if (target.startsWith(`${route}/`) && route.length > bestLength) {
      best = i
      bestLength = route.length
    }
  })
  return best
}

/**
 * Persist a fully reordered recents list (used by the tab bar drag reorder).
 * Home aliases are dropped, hrefs are stored in canonical form, and the list
 * is capped so only the oldest unpinned pages fall off (pinned pages are
 * never silently evicted).
 */
export function saveRecentPages(pages: RecentPage[]): void {
  try {
    const cleaned: RecentPage[] = []
    for (const page of pages) {
      const href = canonicalHref(page.href)
      // The pinned home tab is never persisted — readTabs() re-adds it.
      if (href === DEFAULT_TAB.href) continue
      // Pages that must never appear as tabs are dropped on save.
      if (NEVER_TAB_PATHS.has(href)) continue
      if (cleaned.some((c) => c.href === href)) continue
      cleaned.push({ title: page.title, href, pinned: page.pinned ?? false })
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimToCap(cleaned)))
  } catch {
    // storage unavailable — nothing to save
  }
}

/**
 * Pin (or unpin) a page. Pinned pages lead the strip (right after the home
 * tab) and are never dropped when the recents list overflows its cap.
 */
export function pinRecentPage(href: string, pinned: boolean): void {
  try {
    const target = canonicalHref(href)
    if (isHomeHref(target)) return // the home tab is always pinned
    const stored = readRecentPages()
    const index = stored.findIndex((p) => canonicalHref(p.href) === target)
    const found = index >= 0 ? stored[index] : undefined
    const page: RecentPage = found
      ? { title: found.title, href: canonicalHref(found.href), pinned }
      : { title: href, href: target, pinned }
    // Re-pinning an already-pinned page must not reshuffle it relative to the
    // other pinned pages — only promote the page when it was not pinned yet.
    if (pinned && found?.pinned) {
      const next = stored.map((p) =>
        canonicalHref(p.href) === target ? page : p,
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return
    }
    let next = stored.filter((p) => canonicalHref(p.href) !== target)
    next = pinned
      ? [page, ...next] // pin → move to the front of the stored order
      : [...next, page] // unpin → settle at the end (recency order)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimToCap(next)))
  } catch {
    // storage unavailable — pin simply won't persist
  }
}

/**
 * Recents with the Dashboard home tab pinned first, then user-pinned tabs
 * (in pin order), then the rest (most recent first as stored). The tab strip
 * (and the mobile menu recents) use this, so a freshly logged-in user always
 * sees the Dashboard tab even before visiting anything.
 *
 * Stored entries are cleaned up while reading: stale home aliases ('/' or
 * '/dashboard') are dropped (the pinned tab represents them), leftover
 * non-canonical hrefs are normalized, and duplicates are merged — so tabs
 * recorded before this cleanup never resurface.
 */
export function readTabs(): RecentPage[] {
  const stored = readRecentPages()
  const cleaned: RecentPage[] = []
  let changed = false
  for (const page of stored) {
    if (isHomeHref(page.href)) {
      // Home aliases live in the pinned tab only — drop stale ones.
      changed = true
      continue
    }
    const href = canonicalHref(page.href)
    if (NEVER_TAB_PATHS.has(href)) {
      // Recorded before the never-tab rule existed — purge silently.
      changed = true
      continue
    }
    if (href !== page.href || Boolean(page.pinned) !== page.pinned)
      changed = true
    if (!cleaned.some((c) => c.href === href))
      cleaned.push({ title: page.title, href, pinned: page.pinned ?? false })
  }
  if (changed) saveRecentPages(cleaned)
  // Pinned tabs lead, in the order they were pinned; the rest follow in the
  // stored (most-recently-visited) order.
  const pinned = cleaned.filter((p) => p.pinned)
  const unpinned = cleaned.filter((p) => !p.pinned)
  return [DEFAULT_TAB, ...pinned, ...unpinned].slice(0, MAX_RECENT)
}

/**
 * Stable sort that keeps the pinned home tab (whatever sits at index 0) and
 * every user-pinned page ahead of the unpinned ones, preserving the relative
 * (stored) order inside each group. The tab strip keeps its list in this
 * order so the Dashboard home tab always leads, followed by pinned tabs.
 */
export function pinnedFirst(pages: RecentPage[]): RecentPage[] {
  const [home, ...rest] = pages
  const pinned = rest.filter((p) => p.pinned)
  const unpinned = rest.filter((p) => !p.pinned)
  return home ? [home, ...pinned, ...unpinned] : [...pinned, ...unpinned]
}

/**
 * Cap the stored list at {@link MAX_RECENT} while keeping every pinned page
 * (a pinned tab must never be silently dropped). When the cap is exceeded,
 * only the oldest unpinned pages fall off the end; if even the pinned pages
 * exceed the cap they are trimmed from the end of the pin order.
 */
function trimToCap(pages: RecentPage[]): RecentPage[] {
  if (pages.length <= MAX_RECENT) return pages
  const pinned = pages.filter((p) => p.pinned)
  const unpinned = pages.filter((p) => !p.pinned)
  const drop = pages.length - MAX_RECENT
  return [
    ...pinned,
    ...unpinned.slice(0, Math.max(0, unpinned.length - drop)),
  ].slice(0, MAX_RECENT)
}

/** Remove one page from the recents (used by the tab bar close button). */
export function removeRecentPage(href: string): void {
  try {
    const target = canonicalHref(href)
    const next = readRecentPages().filter(
      (p) => canonicalHref(p.href) !== target,
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable — nothing to remove
  }
}

/**
 * Filter the global recents down to pages that belong to one menu section,
 * keeping recency order (most recent first).
 */
export function recentPagesWithin(
  hrefs: string[],
  limit = 6,
  recents: RecentPage[] = readRecentPages(),
): RecentPage[] {
  const allowed = new Set(hrefs.map(canonicalHref).filter(Boolean))
  return recents
    .filter((p) => !isHomeHref(p.href) && allowed.has(canonicalHref(p.href)))
    .slice(0, limit)
}

/** Find the first menu title whose route matches exactly. */
export function findMenuTitleByRoute(
  nodes: Array<{
    menuName?: string
    route?: string | null
    children?: unknown[]
  }>,
  route: string,
): string | null {
  const walk = (
    items: Array<{
      menuName?: string
      route?: string | null
      children?: unknown[]
    }>,
  ): string | null => {
    for (const node of items) {
      if (node.route && node.route === route && node.menuName)
        return node.menuName
      if (node.children?.length) {
        const found = walk(node.children as typeof items)
        if (found) return found
      }
    }
    return null
  }
  return walk(nodes)
}
