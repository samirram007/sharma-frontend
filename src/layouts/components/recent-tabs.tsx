import { IconChevronDown, IconPlus, IconX } from '@tabler/icons-react'
import { Pin, PinOff } from 'lucide-react'
import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { isForbiddenRoute } from '@/lib/forbidden-details'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { resolveIcon } from '@/features/modules/menu/data/menu-icon-map'
import type { MenuTreeItem } from '@/features/modules/menu/data/menu-tree-types'
import {
  getVoucherTabLabel,
  subscribeVoucherTabLabel,
} from '@/features/modules/voucher/components/voucher-tab-label'
import { collectMenuRoutes } from '@/features/modules/menu/data/menu-route-guard'
import {
  canonicalHref,
  DEFAULT_TAB,
  isNeverTabPath,
  pageTitleForRoute,
  pinRecentPage,
  pinnedFirst,
  pushRecentPage,
  readTabs,
  removeRecentPage,
  saveRecentPages,
  tabHrefForPath,
  type RecentPage,
} from '../lib/recent-pages'

/** Minimum width an inactive tab can shrink to before older tabs collapse into the overflow dropdown. */
const MIN_TAB_WIDTH = 72
/** Maximum width the active tab may use so its full label stays readable. */
const MAX_ACTIVE_TAB_WIDTH = 360
/** Fixed chrome of a tab beyond its text (icon + padding + close button + gaps). */
const ACTIVE_TAB_CHROME = 70
/** Rough per-character width (px) of the label at text-sm font-medium. */
const ACTIVE_TEXT_CHAR_WIDTH = 8
/** gap-1 (4px) between flex children of the strip. */
const TAB_GAP = 4
/** Width of the "+" new-tab button (w-6). */
const PLUS_BUTTON_WIDTH = 24
/** Horizontal padding of the strip (px-2). */
const STRIP_PADDING = 16
/** Rough width of the "{n} more" trigger — grows with the digit count. */
const moreTriggerWidth = (count: number) => 64 + String(count).length * 7

/** How long a closing tab collapses before it is removed from the strip. */
const CLOSE_COLLAPSE_MS = 240
/** Easing of the close collapse — matches the tab-enter curve for symmetry. */
const CLOSE_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Icons per module route from the DB menu tree, keyed by canonical href. */
function buildIconMap(tree: MenuTreeItem[]): Map<string, string | null> {
  const map = new Map<string, string | null>()
  const walk = (nodes: MenuTreeItem[]) => {
    for (const node of nodes) {
      if (node.route) map.set(canonicalHref(node.route), node.icon)
      if (Array.isArray(node.children) && node.children.length > 0)
        walk(node.children)
    }
  }
  walk(tree)
  return map
}

/** The icon name a tab should show, falling back to a page/document glyph. */
function iconNameFor(href: string, icons: Map<string, string | null>): string {
  const direct = icons.get(canonicalHref(href))
  if (direct) return direct
  return canonicalHref(href) === DEFAULT_TAB.href
    ? 'LayoutDashboard'
    : 'FileText'
}

/**
 * Browser-style tab strip of the most recently visited pages.
 * - The Dashboard home tab is pinned first by default (not closable/draggable).
 * - Clicking a tab navigates; tabs never reorder on their own.
 * - Tabs can be reordered by dragging (with a smooth transform transition).
 * - The × collapses the tab (width + fade) before it is removed; the + opens
 *   the new-tab page.
 * - Newly opened tabs slide/fade in; the active tab is marked with a colored
 *   accent and transitions smoothly when activation changes.
 * - Inactive tabs shrink down to a minimum width; once the strip is full,
 *   older tabs collapse into the "N more" overflow dropdown. The active tab
 *   never shrinks below its content, so it always shows its full label.
 * - Right-clicking a tab opens a context menu to pin it (it jumps to the
 *   front, right after the pinned Dashboard) or unpin it. Pinned tabs lead
 *   the strip but may still overflow like any other tab.
 * - Ctrl+Q (Cmd+Q on macOS) closes the active tab, exactly like clicking
 *   its ×; the pinned Dashboard tab is exempt.
 * - Nested URLs (e.g. a voucher record at
 *   '/transactions/vouchers/delivery_note/7045') stay on their menu page's
 *   tab: the deepest tab whose route covers the path stays highlighted and
 *   records never get tabs of their own.
 * - While a voucher record is being edited, the edit page publishes its
 *   number and the active tab shows it as a suffix, e.g.
 *   "Delivery Note (DLNT-4115)"; it reverts when the page is left.
 */
export function RecentTabs() {
  const location = useLocation()
  const navigate = useNavigate()
  const { menuTree, user } = useAuth()
  // Only tabs the current user is actually allowed to see (permission-
  // filtered menu tree) — stale tabs survive storage but must not render.
  const allowedRoutes = useMemo(() => {
    const routes = collectMenuRoutes(menuTree ?? [])
    // The Dashboard home tab is pinned as '/dashboard' (where '/' redirects),
    // but the menu tree stores it as '/' — allow it when the node exists.
    if (routes.includes('/')) routes.push('/dashboard')
    return new Set(routes)
  }, [menuTree])
  const iconByRoute = useMemo(
    () => buildIconMap((menuTree ?? []) as MenuTreeItem[]),
    [menuTree],
  )
  // Menu routes plus the always-allowed static pages (Documents, Profile,
  // …) — the latter have no menu node, so tabs for them must survive the
  // permission filter.
  const tabVisible = useCallback(
    (href: string) =>
      !isNeverTabPath(href) &&
      (allowedRoutes.has(href) ||
        pageTitleForRoute(menuTree ?? [], href) !== null),
    [allowedRoutes, menuTree],
  )
  const [recents, setRecents] = useState<RecentPage[]>(() =>
    readTabs().filter(
      (p) =>
        !isNeverTabPath(p.href) &&
        (allowedRoutes.has(p.href) ||
          pageTitleForRoute(menuTree ?? [], p.href) !== null),
    ),
  ) // Tabs currently playing their close-collapse animation.
  const [closingHrefs, setClosingHrefs] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  // DOM nodes + collapse timers, keyed by tab href.
  const tabEls = useRef(new Map<string, HTMLDivElement | null>())
  const closeTimers = useRef(new Map<string, number>())

  // Strip width drives how many tabs fit inline: once even the minimum-width
  // tabs no longer fit, the rest collapse into the "N more" dropdown.
  const stripRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 0 : window.innerWidth,
  )
  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    const measure = () =>
      setContainerWidth(el.getBoundingClientRect().width || window.innerWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Canonical route of the tab that owns the current path. Exact paths match
  // their own tab; nested pages (record detail URLs) fall back to the deepest
  // tab whose route they live under, so the section tab stays highlighted.
  const activeHref = useMemo(
    () =>
      tabHrefForPath(
        recents.map((p) => p.href),
        location.pathname,
      ),
    [recents, location.pathname],
  )
  // Voucher number published by the voucher page being edited, e.g.
  // " (DLNT-4115)" — appended to the active tab while that page is open.
  const voucherLabel = useSyncExternalStore(
    subscribeVoucherTabLabel,
    getVoucherTabLabel,
  )
  const activeTabSuffix =
    voucherLabel && voucherLabel.pathname === location.pathname
      ? voucherLabel.label
      : ''

  // Tabs stay visible until the strip is full; beyond that they collapse into
  // the "N more" overflow dropdown. The "+" button and the trigger itself are
  // reserved up front, so the count is stable. Inactive tabs each count at
  // their minimum width, while the active tab reserves enough room for its
  // full label (it never shrinks) — trailing tabs drop into overflow first.
  const visibleCount = useMemo(() => {
    const total = recents.length
    if (total <= 1 || containerWidth <= 0) return total
    const activeIndex = activeHref
      ? recents.findIndex((p) => p.href === activeHref)
      : -1
    const tabWidthAt = (index: number, page: RecentPage) => {
      if (index === activeIndex) {
        const textLength = page.title.length + activeTabSuffix.length
        return Math.min(
          MAX_ACTIVE_TAB_WIDTH,
          ACTIVE_TAB_CHROME + textLength * ACTIVE_TEXT_CHAR_WIDTH,
        )
      }
      return MIN_TAB_WIDTH
    }
    let count = total
    for (let attempt = 0; attempt < total; attempt++) {
      const overflow = total - count
      const moreWidth = overflow > 0 ? moreTriggerWidth(overflow) : 0
      let tabsWidth = 0
      for (let index = 0; index < count; index++) {
        tabsWidth += tabWidthAt(index, recents[index])
      }
      const used =
        STRIP_PADDING +
        tabsWidth +
        (count + (overflow > 0 ? 1 : 0)) * TAB_GAP +
        PLUS_BUTTON_WIDTH +
        moreWidth
      if (used <= containerWidth) break
      if (count <= 1) break
      count--
    }
    return count
  }, [recents, containerWidth, activeHref, activeTabSuffix])
  const visibleCountRef = useRef(visibleCount)
  visibleCountRef.current = visibleCount
  // Clear any pending collapse timers on unmount so a closed tab can never be
  // removed from state after the strip is gone.
  useEffect(() => {
    const timers = closeTimers.current
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  )

  // Record the visit (pushing a brand-new page right after the previously
  // active tab) and refresh the strip in the same effect — doing the push
  // here guarantees the new tab shows up immediately, instead of one
  // navigation late.
  //
  // The active tab is promoted here (not in a separate effect) so a tab
  // selected from the "N more" overflow dropdown visibly renders as the
  // activated tab right after the pinned home tab. Doing it in the same
  // place as the storage refresh avoids the promotion being overwritten by
  // a stale re-read of the pre-navigation order.
  const prevPathRef = useRef<string | null>(null)
  useEffect(() => {
    if (!user || !location.pathname) return
    // Guard-blocked navigations render the 403 content on the blocked URL —
    // they must not spawn a tab, and any tab previously recorded for the
    // blocked path is purged from storage.
    if (isForbiddenRoute(location.pathname)) {
      removeRecentPage(location.pathname)
    }
    // Nested URLs (a voucher record at
    // '/transactions/vouchers/delivery_note/7045') must follow their section
    // tab: attribute the visit to the deepest open tab covering the path (the
    // same resolution the active-tab highlight uses) so no tab is created at
    // the raw URL. Only pages with no covering tab get their own one — static
    // pages fall back to their known titles.
    if (!activeHref && !isNeverTabPath(location.pathname)) {
      const title = pageTitleForRoute(menuTree ?? [], location.pathname)
      if (title) {
        pushRecentPage(
          { title, href: location.pathname },
          prevPathRef.current ?? undefined,
        )
      }
    }
    prevPathRef.current = location.pathname
    setRecents(() => {
      let next = readTabs().filter((p) => tabVisible(p.href))
      // A tab picked from the "N more" dropdown sits beyond the visible strip.
      // Bring it into view by promoting it right after the pinned block (the
      // Dashboard tab plus any user-pinned tabs) — pinned tabs keep their
      // places, and the rest of the strip shifts back by one.
      if (activeHref && activeHref !== DEFAULT_TAB.href) {
        const index = next.findIndex((p) => p.href === activeHref)
        if (index >= visibleCountRef.current) {
          const pinnedCount = next.filter((p, i) => i > 0 && p.pinned).length
          const anchor = Math.min(index, 1 + pinnedCount)
          next = [
            ...next.slice(0, anchor),
            next[index],
            ...next.slice(anchor, index),
            ...next.slice(index + 1),
          ]
          saveRecentPages(next)
        }
      }
      return pinnedFirst(next)
    })
  }, [location.pathname, user, menuTree, allowedRoutes, tabVisible, activeHref])

  // Ctrl+Q / Cmd+Q closes the active tab — the keyboard twin of the tab's ×
  // button. The handler is registered once; refs keep it acting on the
  // current tab state (the close logic itself is recreated every render).
  const activeHrefRef = useRef(activeHref)
  activeHrefRef.current = activeHref
  const closeTabRef = useRef<((href: string) => void) | null>(null)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.shiftKey) return
      if (!(event.ctrlKey || event.metaKey)) return
      if (event.key.toLowerCase() !== 'q') return
      // The pinned Dashboard tab never closes (it has no × either).
      const href = activeHrefRef.current
      if (!href || href === DEFAULT_TAB.href) return
      event.preventDefault()
      closeTabRef.current?.(href)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (recents.length === 0) return null

  /**
   * Keep the in-memory order invariant the strip relies on — user-pinned tabs
   * always lead (right after the pinned Dashboard) — after any change that
   * reorders the list (drag reorder, close, pin/unpin).
   */
  const refreshFromStorage = () =>
    // readTabs() pins the Dashboard tab first, orders user-pinned tabs next,
    // then drops anything the current user may no longer see (and never-tab
    // paths such as '/forbidden').
    setRecents(readTabs().filter((p) => tabVisible(p.href)))

  /** Toggle a tab's pinned state via its context menu. */
  const togglePin = (href: string) => {
    pinRecentPage(href, !recents.find((p) => p.href === href)?.pinned)
    refreshFromStorage()
  }

  const removeTab = (href: string) => {
    removeRecentPage(href)
    refreshFromStorage()
    setClosingHrefs((prev) => {
      const next = new Set(prev)
      next.delete(href)
      return next
    })
  }

  /**
   * Close a tab with a prominent collapse: measure the tab, then animate its
   * width (and opacity/overflow) to zero so neighbours slide in smoothly,
   * and only remove it from state once the collapse has finished.
   */
  const closeTab = (href: string) => {
    if (closingHrefs.has(href)) return
    setClosingHrefs((prev) => {
      const next = new Set(prev)
      next.add(href)
      return next
    })

    // Respect the reduced-motion preference: no collapse, just remove.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (href === activeHref && href !== DEFAULT_TAB.href) {
        const recentsNow = readTabs()
        const idx = recentsNow.findIndex((p) => p.href === href)
        const previous = idx > 0 ? recentsNow[idx - 1] : null
        removeTab(href)
        if (previous) void navigate({ to: previous.href })
      } else {
        removeTab(href)
      }
      return
    }

    const el = tabEls.current.get(href)
    if (el) {
      const width = el.getBoundingClientRect().width
      // Collapse the box fully: min-width, inline padding and side borders
      // all clamp the final width from below (border-box), so they must be
      // zeroed along with the width or the tab bottoms out at ~22px wide
      // (72px for inactive tabs via min-w-*) and just pops away at the end.
      el.style.minWidth = '0'
      el.style.paddingLeft = '0'
      el.style.paddingRight = '0'
      el.style.borderLeftWidth = '0'
      el.style.borderRightWidth = '0'
      el.style.overflow = 'hidden'
      el.style.pointerEvents = 'none'
      // Own the whole transition inline while closing: a decelerating curve
      // on the box collapse matched with a quicker fade that starts slightly
      // delayed, so the shrink reads first and the content melts away. (The
      // class transition doesn't cover padding/border-width changes.)
      el.style.transition = `width 220ms ${CLOSE_EASING}, padding 220ms ${CLOSE_EASING}, border-width 220ms ${CLOSE_EASING}, opacity 150ms ease-in 50ms`
      el.style.width = `${width}px`
      // Force a synchronous layout pass so the styles below are transitioned
      // from the measured values instead of snapping to zero instantly.
      void el.offsetWidth
      el.style.width = '0px'
      el.style.opacity = '0'
    }

    // When the active tab is closed, activate the previous tab in the recents
    // queue so the user is not left on a page whose tab no longer exists.
    if (href === activeHref && href !== DEFAULT_TAB.href) {
      const recentsBefore = readTabs()
      const idx = recentsBefore.findIndex((p) => p.href === href)
      const previous = idx > 0 ? recentsBefore[idx - 1] : null
      const timer = window.setTimeout(() => {
        removeTab(href)
        if (previous) {
          // Client-side navigation — a full browser refresh (window.location)
          // would remount the whole SPA just to close a tab.
          void navigate({ to: previous.href })
        }
      }, CLOSE_COLLAPSE_MS)
      closeTimers.current.set(href, timer)
    } else {
      const timer = window.setTimeout(() => removeTab(href), CLOSE_COLLAPSE_MS)
      closeTimers.current.set(href, timer)
    }
  }
  closeTabRef.current = closeTab

  const registerTabEl = useCallback(
    (href: string, el: HTMLDivElement | null) => {
      if (el) tabEls.current.set(href, el)
      else tabEls.current.delete(href)
    },
    [],
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    setRecents((prev) => {
      const oldIndex = prev.findIndex((p) => p.href === active.id)
      const newIndex = prev.findIndex((p) => p.href === over.id)
      if (oldIndex < 0 || newIndex < 0) return prev
      let next = arrayMove(prev, oldIndex, newIndex)
      // The Dashboard home tab is pinned first — it snaps back to position 0.
      const pinned = next.findIndex((p) => p.href === DEFAULT_TAB.href)
      if (pinned > 0) {
        next = [next[pinned], ...next.filter((_, i) => i !== pinned)]
      }
      saveRecentPages(next)
      return pinnedFirst(next)
    })
  }

  const visible = recents.slice(0, visibleCount)
  const overflow = recents.slice(visibleCount)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={visible.map((p) => p.href)}
        strategy={horizontalListSortingStrategy}
      >
        <div
          ref={stripRef}
          data-testid="recent-tabs-strip"
          className="flex items-end gap-1 overflow-hidden px-2 pt-1.5 pb-0"
        >
          {visible.map((page) => (
            <Tab
              key={page.href}
              page={page}
              iconName={iconNameFor(page.href, iconByRoute)}
              isActive={page.href === activeHref}
              isPinned={page.href === DEFAULT_TAB.href}
              isClosing={closingHrefs.has(page.href)}
              titleSuffix={page.href === activeHref ? activeTabSuffix : ''}
              onClose={() => closeTab(page.href)}
              onTogglePin={() => togglePin(page.href)}
              registerEl={registerTabEl}
            />
          ))}
          {overflow.length > 0 && (
            <OverflowTabs
              pages={overflow}
              activeHref={activeHref}
              titleSuffix={activeTabSuffix}
              iconNameForPage={(href) => iconNameFor(href, iconByRoute)}
            />
          )}
          <Link
            to="/new-tab"
            aria-label="Open new tab"
            className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-slate-200"
          >
            <IconPlus size={14} stroke={2.5} />
          </Link>
        </div>
      </SortableContext>
    </DndContext>
  )
}

function Tab({
  page,
  iconName,
  isActive,
  isPinned,
  isClosing,
  titleSuffix,
  onClose,
  onTogglePin,
  registerEl,
}: {
  page: RecentPage
  iconName: string
  isActive: boolean
  isPinned: boolean
  isClosing: boolean
  titleSuffix: string
  onClose: () => void
  onTogglePin: () => void
  registerEl: (href: string, el: HTMLDivElement | null) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.href, disabled: isPinned })

  const Icon = resolveIcon(iconName)
  // The pinned home tab cannot be unpinned (or closed/dragged) — it gets no
  // context menu at all.
  const tab = (
    <div
      ref={(el) => {
        setNodeRef(el)
        registerEl(page.href, el)
      }}
      style={{
        transform: CSS.Transform.toString(transform),
        // dnd-kit only needs to own `transition` while a tab is actually
        // being dragged; outside of a drag the class transition below drives
        // the smooth width/color animations instead.
        transition: isDragging ? transition : undefined,
      }}
      {...attributes}
      {...listeners}
      data-testid={`recent-tab-${page.href}`}
      className={cn(
        'tab-enter group relative flex items-center rounded-t-lg border border-b-0 px-2.5 pt-1.5 pb-2 text-sm',
        // The active tab never shrinks below its content, so its full label
        // stays readable; inactive tabs flex down to the shared minimum and
        // ellipsize instead.
        isActive ? 'max-w-[360px] shrink-0' : 'min-w-[72px] max-w-[200px]',
        'transition-[width,opacity,background-color,border-color,color,box-shadow] duration-200 ease-out',
        !isPinned &&
          !isClosing &&
          'cursor-grab touch-none active:cursor-grabbing',
        isDragging && 'z-10 opacity-80 shadow-lg',
        isClosing && 'pointer-events-none overflow-hidden',
        isActive
          ? '-mb-px border-slate-200/80 bg-white text-slate-900 shadow-sm dark:border-white/10 dark:bg-card dark:text-slate-100'
          : 'border-transparent bg-slate-200/60 text-slate-500 hover:bg-slate-300/60 hover:text-slate-800 dark:bg-slate-800/70 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-slate-200',
      )}
    >
      <Link
        to={page.href}
        title={`${page.title}${titleSuffix}`}
        className="flex min-w-0 flex-1 items-center gap-1.5 py-0.5"
      >
        <Icon
          size={13}
          strokeWidth={2}
          className={cn(
            'shrink-0 transition-colors',
            isActive
              ? 'text-blue-600 dark:text-sky-400'
              : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400',
          )}
        />
        <span
          className={cn(
            'truncate font-medium transition-colors',
            isActive && 'text-blue-700 dark:text-sky-300',
          )}
        >
          {page.title}
          {titleSuffix}
        </span>
        {page.pinned && !isPinned && (
          <Pin
            aria-label="Pinned tab"
            className={cn(
              'h-2.5 w-2.5 shrink-0 rotate-45 transition-colors',
              isActive
                ? 'text-blue-500 dark:text-sky-400'
                : 'text-slate-400 dark:text-slate-500',
            )}
          />
        )}
      </Link>
      {!isPinned && !isClosing && (
        <button
          type="button"
          aria-label={`Close ${page.title} tab`}
          title={`Close ${page.title} tab`}
          onClick={onClose}
          // The whole tab is a dnd-kit drag node — don't let a press on the
          // close button start a tab drag (the grab cursor / drag overlay
          // made the × feel unclickable).
          onPointerDown={(event) => event.stopPropagation()}
          className={cn(
            'relative z-10 -mr-1 ml-1.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors',
            isActive
              ? 'text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100'
              : 'text-slate-400 opacity-70 hover:bg-slate-400/30 hover:text-slate-800 dark:text-slate-500 dark:hover:bg-slate-600/70 dark:hover:text-slate-100',
          )}
        >
          <IconX size={13} stroke={2.5} />
        </button>
      )}
      {/* Colored mark for the active tab — fades/scales in on activation. */}
      {isActive && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-1.5 bottom-[1.5px] h-[2.5px] rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 shadow-[0_0_6px_rgb(59_130_246/0.55)] animate-in fade-in-0 zoom-in-90 duration-200"
        />
      )}
    </div>
  )

  // Right-click a tab to pin it (it jumps to the front, right after the
  // pinned home tab) or unpin it. The pinned home tab has no menu.
  return isPinned ? (
    tab
  ) : (
    <ContextMenu>
      <ContextMenuTrigger asChild>{tab}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-[180px] border border-slate-200/80 p-1.5 dark:border-white/[0.07]">
        {page.pinned ? (
          <ContextMenuItem
            data-testid="tab-action-unpin"
            onSelect={onTogglePin}
            className="cursor-pointer"
          >
            <PinOff className="h-3.5 w-3.5" />
            Unpin tab
          </ContextMenuItem>
        ) : (
          <ContextMenuItem
            data-testid="tab-action-pin"
            onSelect={onTogglePin}
            className="cursor-pointer"
          >
            <Pin className="h-3.5 w-3.5" />
            Pin tab
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          data-testid="tab-action-close"
          variant="destructive"
          onSelect={onClose}
          className="cursor-pointer"
        >
          <IconX size={14} />
          Close tab
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function OverflowTabs({
  pages,
  activeHref,
  titleSuffix,
  iconNameForPage,
}: {
  pages: RecentPage[]
  activeHref: string | null
  titleSuffix: string
  iconNameForPage: (href: string) => string
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <span
          title={`${pages.length} more tabs`}
          className="mb-0.5 flex h-6 shrink-0 cursor-pointer items-center gap-0.5 rounded-md px-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-slate-200"
        >
          {pages.length} more
          <IconChevronDown size={12} />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="min-w-[200px] border border-slate-200/80 dark:border-white/[0.07] p-1.5"
      >
        <DropdownMenuLabel className="flex items-center gap-1.5 px-2 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Older tabs
        </DropdownMenuLabel>
        {pages.map((page) => {
          const Icon = resolveIcon(iconNameForPage(page.href))
          const active = page.href === activeHref
          return (
            <DropdownMenuItem key={page.href} asChild>
              <Link
                to={page.href}
                className={cn(
                  'flex items-center gap-2 rounded-md',
                  active &&
                    'bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
                )}
              >
                <Icon
                  size={14}
                  strokeWidth={2}
                  className={cn(
                    'shrink-0',
                    active
                      ? 'text-blue-600 dark:text-sky-400'
                      : 'text-slate-400 dark:text-slate-500',
                  )}
                />
                {page.title}
                {active ? titleSuffix : ''}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
