/**
 * Type definitions for the menu tree API response from GET /api/auth/menus.
 */

/** A single node in the hierarchical menu tree returned by the backend. */
export interface MenuTreeItem {
  id: number
  menuName: string
  route: string | null
  icon: string | null
  isGroup: boolean
  sortOrder: number
  featureCode: string | null
  children: MenuTreeItem[]
}

/** API response wrapper. */
export interface MenuTreeResponse {
  status: string
  data: MenuTreeItem[]
}
