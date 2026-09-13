import { QueryClient } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchMenuService } from './api'
import { clearForbiddenRoute, getForbiddenRoute } from '@/lib/forbidden-details'
import type { MenuTreeItem } from './menu-tree-types'
import {
  collectMenuRoutes,
  guardMenuRoutes,
  isBlockedMenuPath,
  matchMostSpecificRoute,
} from './menu-route-guard'
import { fetchMenuTreeService } from './services'

// Automock the menu list API (MenuQueryOptions' queryFn resolves through
// fetchMenuService) and patch only the tree fetch, keeping the real
// menuTreeQueryOptions wrapper intact.
vi.mock('./api')
vi.mock('./services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./services')>()
  const fetchMenuTreeService = vi.fn()
  // The real menuTreeQueryOptions closes over the real fetch, so it must be
  // rebuilt around the mock — otherwise the guard hits the network.
  const { queryOptions } = await import('@tanstack/react-query')
  return {
    ...actual,
    fetchMenuTreeService,
    menuTreeQueryOptions: () =>
      queryOptions({
        queryKey: ['MenuTree'],
        queryFn: fetchMenuTreeService,
        staleTime: 1000 * 60 * 30,
        retry: 1,
      }),
  }
})

const node = (overrides: Partial<MenuTreeItem>): MenuTreeItem => ({
  id: 1,
  menuName: 'Node',
  route: null,
  icon: null,
  description: null,
  isGroup: false,
  isTopMenu: false,
  sortOrder: 0,
  featureCode: null,
  children: [],
  ...overrides,
})

const tree: MenuTreeItem[] = [
  node({
    menuName: 'Transactions',
    isGroup: true,
    children: [
      node({ menuName: 'Freight', route: '/transactions/freight' }),
      node({ menuName: 'Day Book', route: '/reports/day_book' }),
    ],
  }),
  node({
    menuName: 'Reports',
    isGroup: true,
    children: [
      node({
        menuName: 'Financial Statements',
        isGroup: true,
        children: [
          node({ menuName: 'Balance Sheet', route: '/reports/balance_sheet' }),
        ],
      }),
    ],
  }),
  node({ menuName: 'Dashboard', route: '/dashboard' }),
]

describe('collectMenuRoutes', () => {
  it('collects routable leaves at any depth, skipping groups', () => {
    expect(collectMenuRoutes(tree)).toEqual([
      '/transactions/freight',
      '/reports/day_book',
      '/reports/balance_sheet',
      '/dashboard',
    ])
  })

  it('returns an empty array for an empty tree', () => {
    expect(collectMenuRoutes([])).toEqual([])
  })

  it('tolerates flat lists whose items omit the children key', () => {
    // GET /api/menus returns one row per menu entry — no children arrays.
    const flat: MenuTreeItem[] = [
      node({ menuName: 'Freight', route: '/transactions/freight' }),
      node({ menuName: 'Day Book', route: '/reports/day_book' }),
      node({ menuName: 'Balance Sheet', route: '/reports/balance_sheet' }),
      node({ menuName: 'Dashboard', route: '/dashboard' }),
    ]
    expect(collectMenuRoutes(flat)).toEqual([
      '/transactions/freight',
      '/reports/day_book',
      '/reports/balance_sheet',
      '/dashboard',
    ])
  })
})

describe('isBlockedMenuPath', () => {
  const all = collectMenuRoutes(tree)
  const visible = ['/transactions/freight', '/reports/balance_sheet']

  it('blocks an exact menu route missing from the visible tree', () => {
    expect(isBlockedMenuPath('/reports/day_book', all, visible)).toBe(true)
    expect(isBlockedMenuPath('/dashboard', all, visible)).toBe(true)
  })

  it('allows an exact menu route present in the visible tree', () => {
    expect(isBlockedMenuPath('/transactions/freight', all, visible)).toBe(false)
    expect(isBlockedMenuPath('/reports/balance_sheet', all, visible)).toBe(
      false,
    )
  })

  it('blocks detail paths under a blocked menu route', () => {
    expect(isBlockedMenuPath('/reports/day_book/123', all, visible)).toBe(true)
    expect(isBlockedMenuPath('/dashboard/widgets', all, visible)).toBe(true)
  })

  it('allows detail paths under a visible menu route', () => {
    expect(isBlockedMenuPath('/transactions/freight/42', all, visible)).toBe(
      false,
    )
  })

  it('does not confuse sibling routes sharing a prefix', () => {
    // /transactions/freight-zone-wise is NOT under /transactions/freight
    expect(
      isBlockedMenuPath('/transactions/freight-zone-wise', all, visible),
    ).toBe(false)
  })

  it('a root "/" menu route only matches the exact root path', () => {
    const withHome = [...all, '/']
    // The "/" entry must not blanket-match deeper paths
    expect(isBlockedMenuPath('/reports/day_book', withHome, visible)).toBe(true)
    expect(isBlockedMenuPath('/transactions/freight', withHome, visible)).toBe(
      false,
    )
    // The exact "/" path itself is menu-controlled
    expect(isBlockedMenuPath('/', withHome, visible)).toBe(true)
  })

  it('never blocks non-menu paths', () => {
    expect(isBlockedMenuPath('/sign-in', all, visible)).toBe(false)
    expect(isBlockedMenuPath('/forbidden', all, visible)).toBe(false)
    expect(isBlockedMenuPath('/help-center', all, visible)).toBe(false)
  })

  it('normalizes trailing slashes', () => {
    expect(isBlockedMenuPath('/reports/day_book/', all, visible)).toBe(true)
  })
})

describe('matchMostSpecificRoute', () => {
  it('prefers a child route over its parent when both match', () => {
    const routes = [
      '/transactions/vouchers',
      '/transactions/vouchers/delivery_note',
      '/transactions/vouchers/receipt_note',
    ]
    expect(
      matchMostSpecificRoute(
        '/transactions/vouchers/delivery_note/4833',
        routes,
      ),
    ).toBe('/transactions/vouchers/delivery_note')
  })

  it('matches an exact route when no child exists', () => {
    const routes = ['/transactions/freight']
    expect(matchMostSpecificRoute('/transactions/freight/123', routes)).toBe(
      '/transactions/freight',
    )
  })

  it('returns empty string when no route matches', () => {
    const routes = ['/transactions/freight']
    expect(matchMostSpecificRoute('/reports/day_book', routes)).toBe('')
  })

  it('does not let "/" match everything', () => {
    const routes = ['/', '/dashboard']
    expect(matchMostSpecificRoute('/dashboard/settings', routes)).toBe(
      '/dashboard',
    )
  })

  it('handles multiple nesting levels', () => {
    const routes = [
      '/transactions',
      '/transactions/vouchers',
      '/transactions/vouchers/delivery_note',
    ]
    expect(
      matchMostSpecificRoute(
        '/transactions/vouchers/delivery_note/4833',
        routes,
      ),
    ).toBe('/transactions/vouchers/delivery_note')
  })
})

describe('guardMenuRoutes fail-open behavior', () => {
  const context = {
    queryClient: new QueryClient({
      defaultOptions: { queries: { retry: false } },
    }),
    auth: { isAuthenticated: true, permissions: [] },
  } as unknown as Parameters<typeof guardMenuRoutes>[0]

  beforeEach(() => {
    clearForbiddenRoute()
    context.queryClient.clear()
    vi.mocked(fetchMenuService).mockReset()
    vi.mocked(fetchMenuTreeService).mockReset()
  })

  afterEach(() => {
    clearForbiddenRoute()
  })

  it('blocks a menu-controlled path absent from the visible tree', async () => {
    // Full list contains the route; the user's visible tree does not.
    vi.mocked(fetchMenuService).mockResolvedValue({
      data: [node({ menuName: 'Day Book', route: '/reports/day_book' })],
    })
    vi.mocked(fetchMenuTreeService).mockResolvedValue({
      status: 'success',
      data: [],
    })

    await guardMenuRoutes(context, '/reports/day_book', 'enter')

    expect(getForbiddenRoute()?.attemptedPath).toBe('/reports/day_book')
  })

  it('does NOT block when the menus API fails — navigation fails open', async () => {
    // Backend down / 500 on the full menu list: the guard must swallow the
    // error instead of crashing the navigation into the global 500 page.
    vi.mocked(fetchMenuService).mockRejectedValue(new Error('network down'))
    vi.mocked(fetchMenuTreeService).mockRejectedValue(
      new Error('network down'),
    )

    await expect(
      guardMenuRoutes(context, '/reports/day_book', 'enter'),
    ).resolves.toBeUndefined()

    // Nothing was recorded as forbidden — the page is allowed to load.
    expect(getForbiddenRoute()).toBeNull()
  })

  it('does NOT block when only the visible-tree API fails', async () => {
    vi.mocked(fetchMenuService).mockResolvedValue({
      data: [node({ menuName: 'Day Book', route: '/reports/day_book' })],
    })
    vi.mocked(fetchMenuTreeService).mockRejectedValue(
      new Error('auth/menus down'),
    )

    await expect(
      guardMenuRoutes(context, '/reports/day_book', 'enter'),
    ).resolves.toBeUndefined()
    expect(getForbiddenRoute()).toBeNull()
  })

  it('skips the check entirely for link preloads', async () => {
    await guardMenuRoutes(context, '/reports/day_book', 'preload')

    // No queries were even started.
    expect(fetchMenuService).not.toHaveBeenCalled()
    expect(getForbiddenRoute()).toBeNull()
  })
})
