import type { ElementType } from 'react'
import type { MenuTreeItem } from '@/features/modules/menu/data/menu-tree-types'
import { resolveIcon } from '@/features/modules/menu/data/menu-icon-map'
import { reportLinks } from './report-links'

export interface TopNavSubmenuItem {
  title: string
  href: string
  visible: boolean
  isActive: boolean
  disabled?: boolean
  icon?: ElementType
}

export interface TopNavSubmenuGroup {
  title: string
  description?: string
  visible: boolean
  menus: TopNavSubmenuItem[]
  icon?: ElementType
}

export interface TopNavLink {
  title: string
  href: string
  visible: boolean
  isActive: boolean
  disabled?: boolean
  icon?: ElementType
  hasSubmenu?: boolean
  submenuItems?: TopNavSubmenuGroup[]
}

export const topNavLinks: TopNavLink[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: resolveIcon('LayoutDashboard'),
    visible: false,
    isActive: false,
    disabled: true,
  },
  {
    title: 'Received(GRN)',
    href: '/transactions/vouchers/receipt_note',
    icon: resolveIcon('TruckDelivery'),
    visible: true,
    isActive: false,
    disabled: true,
  },
  {
    title: 'Delivery Note',
    href: '/transactions/vouchers/delivery_note',
    icon: resolveIcon('Truck'),
    visible: true,
    isActive: false,
    disabled: true,
  },
  {
    title: 'Conversion',
    href: '/transactions/vouchers/conversion_journal',
    icon: resolveIcon('ClipboardType'),
    visible: true,
    isActive: false,
    disabled: true,
  },
  {
    title: 'Freight',
    href: '/transactions/freight',
    icon: resolveIcon('TruckDelivery'),
    visible: true,
    isActive: false,
    disabled: false,
  },
  {
    title: 'Day Book',
    href: '/reports/day_book',
    icon: resolveIcon('Book'),
    visible: false,
    isActive: true,
    disabled: false,
  },
  {
    title: 'Reports',
    href: '/reports/stock_summary',
    icon: resolveIcon('ChartBar'),
    hasSubmenu: true,
    submenuItems: reportLinks,
    visible: true,
    isActive: false,
    disabled: false,
  },
]

/**
 * Convert a (permission-filtered) DB menu tree into top-navigation links.
 *
 * Only nodes flagged `isTopMenu` become top-nav entries — regardless of where
 * they sit in the sidebar hierarchy (the backend promotes them to the top of
 * the response):
 * - A node with children becomes a submenu (dropdown) link whose children are
 *   the dropdown items.
 * - A leaf node becomes a direct link; leaves without a route are skipped.
 *
 * Icons are resolved from the DB icon name via `resolveIcon` (falling back to a
 * default icon, matching the sidebar). Nodes without any routable content are
 * dropped entirely. The backend already filters this tree by the user's role
 * permissions, so no extra gating is needed.
 */
export function buildTopNavLinksFromTree(tree: MenuTreeItem[]): TopNavLink[] {
  return tree
    .filter((node) => node.isTopMenu)
    .map((node): TopNavLink | null => {
      const routableChildren = node.children.filter((child) => !!child.route)

      if (routableChildren.length > 0) {
        return {
          title: node.menuName,
          href: node.route ?? routableChildren[0].route ?? '',
          icon: resolveIcon(node.icon),
          visible: true,
          isActive: false,
          disabled: false,
          hasSubmenu: true,
          submenuItems: [
            {
              title: node.menuName,
              icon: resolveIcon(node.icon),
              visible: true,
              menus: routableChildren.map((child) => ({
                title: child.menuName,
                href: child.route!,
                icon: resolveIcon(child.icon),
                visible: true,
                isActive: false,
                disabled: false,
              })),
            },
          ],
        }
      }

      // Leaf node — needs a route to be a useful link
      if (!node.route) return null

      return {
        title: node.menuName,
        href: node.route,
        icon: resolveIcon(node.icon),
        visible: true,
        isActive: false,
        disabled: false,
      }
    })
    .filter((link): link is TopNavLink => link !== null)
}

/**
 * Collect every route present in the (permission-filtered) menu tree.
 * The top navigation is gated against these routes, so a user only sees the
 * links they actually have permission for — mirroring the sidebar, which is
 * rendered from the same tree.
 */
export function collectAllowedRoutes(
  tree: Array<{ route?: string | null; children?: unknown[] }>,
): string[] {
  const routes = new Set<string>()

  const walk = (
    nodes: Array<{ route?: string | null; children?: unknown[] }>,
  ) => {
    for (const node of nodes) {
      if (node.route) routes.add(node.route)
      if (node.children?.length)
        walk(
          node.children as Array<{
            route?: string | null
            children?: unknown[]
          }>,
        )
    }
  }

  walk(tree)
  return Array.from(routes)
}

/**
 * Filter the top navigation links down to what the current user may see.
 *
 * - Non-submenu links are kept when their route exists in `allowedRoutes`.
 * - Submenu links keep only the submenu groups/items whose routes are
 *   allowed, and are dropped entirely when nothing remains underneath.
 */
export function filterTopNavLinks(
  links: TopNavLink[],
  allowedRoutes: string[],
): TopNavLink[] {
  const isAllowed = (href?: string) => !!href && allowedRoutes.includes(href)

  return links
    .filter((link) => link.visible)
    .map((link) => {
      if (!link.hasSubmenu || !link.submenuItems) return link

      const submenuItems = link.submenuItems
        .map((group) => ({
          ...group,
          menus: group.menus.filter(
            (item) => item.visible && isAllowed(item.href),
          ),
        }))
        .filter((group) => group.menus.length > 0)

      return { ...link, submenuItems }
    })
    .filter((link) =>
      link.hasSubmenu
        ? (link.submenuItems?.length ?? 0) > 0
        : isAllowed(link.href),
    )
}
