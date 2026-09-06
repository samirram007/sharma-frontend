import { describe, expect, it } from 'vitest'
import type { MenuTreeItem } from './menu-tree-types'
import {
  collectMenuRoutes,
  isBlockedMenuPath,
  matchMostSpecificRoute,
} from './menu-route-guard'

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
      matchMostSpecificRoute('/transactions/vouchers/delivery_note/4833', routes),
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
      matchMostSpecificRoute('/transactions/vouchers/delivery_note/4833', routes),
    ).toBe('/transactions/vouchers/delivery_note')
  })
})
