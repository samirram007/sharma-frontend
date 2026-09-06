import { IconSearch, IconStar } from '@tabler/icons-react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { ElementType } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { topMenuTreeQueryOptions } from '@/features/modules/menu/data/services'
import { resolveIcon } from '@/features/modules/menu/data/menu-icon-map'
import type { MenuTreeItem } from '@/features/modules/menu/data/menu-tree-types'
import { readTabs, type RecentPage } from '@/layouts/lib/recent-pages'
import {
  readFavoriteHrefs,
  toggleFavoriteHref,
} from '@/layouts/lib/favorite-shortcuts'

export const Route = createFileRoute('/_protected/new-tab')({
  component: NewTabPage,
})

/** How many non-favorite shortcuts show by default before the "N more" hint. */
const MAX_ALL_VISITED = 8

/** Extra regular (top-nav) items always offered alongside visited pages. */
const MAX_REGULAR_SUPPLEMENT = 4

interface Shortcut {
  title: string
  href: string
  icon: ElementType
  description: string
}

/**
 * Build a route -> { title, icon, description } map from the (permission
 * filtered) menu tree, so visited pages can be enriched with their real icon
 * and description. Children inherit the parent group's description when they
 * don't have their own.
 */
function buildShortcutMap(tree: MenuTreeItem[]): Map<string, Shortcut> {
  const map = new Map<string, Shortcut>()
  const walk = (nodes: MenuTreeItem[], parentDescription = '') => {
    for (const node of nodes) {
      if (node.route) {
        map.set(node.route, {
          title: node.menuName,
          href: node.route,
          icon: resolveIcon(node.icon ?? undefined),
          description: node.description ?? parentDescription ?? '',
        })
      }
      if (node.children?.length) {
        walk(node.children, node.description ?? parentDescription)
      }
    }
  }
  walk(tree)
  return map
}

function NewTabPage() {
  const { menuTree, user } = useAuth()
  const [recents] = useState<RecentPage[]>(() => readTabs())
  const [favorites, setFavorites] = useState<string[]>(() =>
    readFavoriteHrefs(),
  )
  const [query, setQuery] = useState('')

  const shortcutByRoute = useMemo(
    () => buildShortcutMap(menuTree ?? []),
    [menuTree],
  )

  // A few "regular" items (the top-nav menus) are always offered alongside
  // visited pages so the grid never feels empty.
  const { data: topMenuData } = useQuery({
    ...topMenuTreeQueryOptions(),
    enabled: !!user,
  })
  const regularShortcuts = useMemo(() => {
    const out: Shortcut[] = []
    const seen = new Set<string>()
    const walk = (nodes: MenuTreeItem[]) => {
      for (const node of nodes) {
        if (node.route) {
          const s = shortcutByRoute.get(node.route)
          if (s && !seen.has(s.href)) {
            seen.add(s.href)
            out.push(s)
          }
        }
        if (node.children?.length) walk(node.children)
      }
    }
    walk(topMenuData?.data ?? [])
    return out
  }, [topMenuData, shortcutByRoute])

  // Shortcut pool = most-visited pages (tab strip order) + favorited pages
  // (so a star is sticky even after the tab closes) + a few regular items.
  // Everything is only rendered when it still exists in the current
  // (permission-filtered) menu tree — and the Dashboard home tab is never
  // shown here. Anything the user may no longer see is dropped entirely.
  const shortcuts = useMemo(() => {
    const seen = new Set<string>()
    const out: Shortcut[] = []
    const isHome = (href: string) => href === '/' || href === '/dashboard'
    const push = (href: string) => {
      if (seen.has(href) || isHome(href)) return
      const fromTree = shortcutByRoute.get(href)
      if (!fromTree) return
      seen.add(href)
      out.push(fromTree)
    }
    for (const page of recents) push(page.href)
    for (const href of favorites) push(href)
    let added = 0
    for (const s of regularShortcuts) {
      if (added >= MAX_REGULAR_SUPPLEMENT) break
      if (!seen.has(s.href) && !isHome(s.href)) {
        push(s.href)
        added++
      }
    }

    const q = query.trim().toLowerCase()
    return out.filter(
      (s) =>
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    )
  }, [recents, favorites, regularShortcuts, shortcutByRoute, query])

  const favoriteShortcuts = shortcuts.filter((s) => favorites.includes(s.href))
  // Keep the grid tight — only a handful of most-visited pages by default;
  // searching reveals the full set.
  const allVisible = query.trim()
    ? shortcuts
    : shortcuts.slice(0, MAX_ALL_VISITED)
  const hiddenCount = shortcuts.length - allVisible.length

  const toggle = (href: string) => {
    setFavorites(toggleFavoriteHref(href))
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Shortcuts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your most-visited pages, at a glance.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <IconSearch
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shortcuts…"
            aria-label="Search shortcuts"
            className="w-full rounded-lg border border-slate-200/80 bg-white/70 py-2 pr-3 pl-9 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-blue-400/70 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-card"
          />
        </div>
      </header>

      {shortcuts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300/70 px-6 py-12 text-center text-sm text-muted-foreground dark:border-white/10">
          {query
            ? 'No shortcuts match your search.'
            : 'Pages you visit will appear here as shortcuts — star your favourites to keep them handy.'}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {favoriteShortcuts.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <IconStar size={15} className="fill-amber-400 text-amber-400" />
                Favorites
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {favoriteShortcuts.map((shortcut) => (
                  <ShortcutCard
                    key={shortcut.href}
                    shortcut={shortcut}
                    isFavorite
                    onToggleFavorite={() => toggle(shortcut.href)}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              All shortcuts
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {allVisible.map((shortcut) => (
                <ShortcutCard
                  key={shortcut.href}
                  shortcut={shortcut}
                  isFavorite={favorites.includes(shortcut.href)}
                  onToggleFavorite={() => toggle(shortcut.href)}
                />
              ))}
            </div>
            {hiddenCount > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                …and {hiddenCount} more. Use the search box to see them all.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function ShortcutCard({
  shortcut,
  isFavorite,
  onToggleFavorite,
}: {
  shortcut: Shortcut
  isFavorite: boolean
  onToggleFavorite: () => void
}) {
  const { title, href, icon: Icon, description } = shortcut
  return (
    <div
      data-testid="shortcut-card"
      className="group relative flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300/70 hover:shadow-md dark:border-white/[0.07] dark:bg-card dark:hover:border-blue-500/40"
    >
      <button
        type="button"
        aria-label={
          isFavorite
            ? `Remove ${title} from favorites`
            : `Add ${title} to favorites`
        }
        onClick={onToggleFavorite}
        className={cn(
          'absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-md transition-all',
          isFavorite
            ? 'text-amber-400'
            : 'text-slate-400 opacity-0 hover:bg-slate-200/70 hover:text-amber-500 group-hover:opacity-100 dark:hover:bg-slate-700/70',
        )}
      >
        <IconStar size={16} className={isFavorite ? 'fill-amber-400' : ''} />
      </button>
      <Link to={href} className="flex min-w-0 flex-col gap-3 pr-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:group-hover:bg-blue-950/60">
          <Icon size={26} />
        </span>
        <span className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </span>
          {description && (
            <span className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {description}
            </span>
          )}
        </span>
      </Link>
    </div>
  )
}
