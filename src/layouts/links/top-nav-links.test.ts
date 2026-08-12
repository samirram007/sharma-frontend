import { describe, expect, it } from 'vitest'
import type { MenuTreeItem } from '@/features/modules/menu/data/menu-tree-types'
import {
  buildTopNavLinksFromTree,
  filterTopNavLinks,
  topNavLinks,
} from './top-nav-links'

const node = (overrides: Partial<MenuTreeItem>): MenuTreeItem => ({
  id: 1,
  menuName: 'Menu',
  route: '/some/route',
  icon: null,
  isGroup: false,
  isTopMenu: false,
  sortOrder: 0,
  featureCode: null,
  children: [],
  ...overrides,
})

describe('filterTopNavLinks', () => {
  it('keeps only visible links whose route is in the allowed set', () => {
    const links = filterTopNavLinks(topNavLinks, ['/transactions/freight'])
    const titles = links.map((link) => link.title)

    expect(titles).toContain('Freight')
    expect(titles).not.toContain('Received(GRN)')
    expect(titles).not.toContain('Delivery Note')
    expect(titles).not.toContain('Conversion')
    // Day Book is marked visible: false in the source data
    expect(titles).not.toContain('Day Book')
  })

  it('keeps Received(GRN), Delivery Note, and Conversion when their routes are allowed', () => {
    const links = filterTopNavLinks(topNavLinks, [
      '/transactions/vouchers/receipt_note',
      '/transactions/vouchers/delivery_note',
      '/transactions/vouchers/conversion_journal',
    ])
    const titles = links.map((link) => link.title)

    expect(titles).toContain('Received(GRN)')
    expect(titles).toContain('Delivery Note')
    expect(titles).toContain('Conversion')
    expect(titles).not.toContain('Freight')
  })

  it('drops the Reports submenu entirely when no report link is allowed', () => {
    const links = filterTopNavLinks(topNavLinks, ['/transactions/freight'])
    expect(links.some((link) => link.title === 'Reports')).toBe(false)
  })

  it('keeps the Reports submenu with only the allowed report links', () => {
    const links = filterTopNavLinks(topNavLinks, [
      '/transactions/freight',
      '/reports/day_book',
      '/reports/receipt_note_report',
    ])

    const reports = links.find((link) => link.title === 'Reports')
    expect(reports).toBeDefined()

    const flat = (reports?.submenuItems ?? []).flatMap((group) =>
      group.menus.map((item) => item.title),
    )
    expect(flat).toContain('Day Book')
    expect(flat).toContain('Receipt Note Report')
    expect(flat).not.toContain('Distributor Book')
  })
})

describe('buildTopNavLinksFromTree', () => {
  it('keeps only root nodes flagged isTopMenu', () => {
    const links = buildTopNavLinksFromTree([
      node({
        id: 1,
        menuName: 'Freight',
        route: '/transactions/freight',
        isTopMenu: true,
      }),
      node({ id: 2, menuName: 'Hidden', route: '/hidden', isTopMenu: false }),
    ])

    expect(links.map((link) => link.title)).toEqual(['Freight'])
    expect(links[0].href).toBe('/transactions/freight')
    expect(links[0].hasSubmenu).toBeFalsy()
  })

  it('turns a node with children into a submenu link', () => {
    const links = buildTopNavLinksFromTree([
      node({
        id: 1,
        menuName: 'Reports',
        route: '/reports/stock_summary',
        isTopMenu: true,
        children: [
          node({ id: 2, menuName: 'Day Book', route: '/reports/day_book' }),
          node({
            id: 3,
            menuName: 'Receipt Book',
            route: '/reports/receipt_book',
          }),
        ],
      }),
    ])

    expect(links).toHaveLength(1)
    const reports = links[0]
    expect(reports.title).toBe('Reports')
    expect(reports.hasSubmenu).toBe(true)

    const items = (reports.submenuItems ?? []).flatMap((group) =>
      group.menus.map((item) => item.href),
    )
    expect(items).toEqual(['/reports/day_book', '/reports/receipt_book'])
  })

  it('skips leaf nodes without a route and parents without routable children', () => {
    const links = buildTopNavLinksFromTree([
      node({ id: 1, menuName: 'No Route', route: null, isTopMenu: true }),
      node({
        id: 2,
        menuName: 'Empty Group',
        route: null,
        isTopMenu: true,
        children: [node({ id: 3, menuName: 'Child No Route', route: null })],
      }),
    ])

    expect(links).toEqual([])
  })

  it('falls back to the first child route for the parent href when the parent has none', () => {
    const links = buildTopNavLinksFromTree([
      node({
        id: 1,
        menuName: 'Group',
        route: null,
        isTopMenu: true,
        children: [node({ id: 2, menuName: 'Child', route: '/child' })],
      }),
    ])

    expect(links[0].href).toBe('/child')
    expect(links[0].hasSubmenu).toBe(true)
  })

  it('resolves DB icon names to icon components for links, submenu groups and items', () => {
    const links = buildTopNavLinksFromTree([
      node({
        id: 1,
        menuName: 'Reports',
        icon: 'ChartBar',
        route: '/reports',
        isTopMenu: true,
        children: [
          node({
            id: 2,
            menuName: 'Day Book',
            route: '/reports/day_book',
            icon: 'Notebook',
          }),
          node({
            id: 3,
            menuName: 'Freight',
            route: '/reports/freight',
            icon: 'UnknownIcon',
          }),
        ],
      }),
      node({
        id: 4,
        menuName: 'Freight',
        route: '/transactions/freight',
        icon: 'TruckDelivery',
        isTopMenu: true,
      }),
    ])

    // lucide-react v1 exports icons as objects ({ $$typeof, render }); older
    // versions and Tabler export function components — accept both.
    const isRenderableIcon = (icon: unknown) =>
      typeof icon === 'function' ||
      (typeof icon === 'object' && icon !== null && 'render' in icon)

    const reports = links.find((link) => link.title === 'Reports')
    expect(reports).toBeDefined()
    // Top-level submenu trigger gets the parent's icon
    expect(isRenderableIcon(reports?.icon)).toBe(true)

    const group = reports?.submenuItems?.[0]
    expect(isRenderableIcon(group?.icon)).toBe(true)

    const itemIcons = (reports?.submenuItems ?? []).flatMap((g) =>
      g.menus.map((item) => item.icon),
    )
    // 'Notebook' resolves to an icon; unknown names fall back to a default icon too
    expect(itemIcons.every((icon) => isRenderableIcon(icon))).toBe(true)

    // Leaf links get their own resolved icon
    const freight = links.find((link) => link.title === 'Freight')
    expect(isRenderableIcon(freight?.icon)).toBe(true)
  })
})
