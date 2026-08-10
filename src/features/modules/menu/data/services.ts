import { queryOptions } from '@tanstack/react-query'
import { getData } from '@/utils/dataClient'
import type { MenuTreeResponse } from './menu-tree-types'

const MENU_TREE_KEY = 'MenuTree'
const TOP_MENU_TREE_KEY = 'TopMenuTree'

/**
 * Fetch the role-filtered hierarchical menu tree from the backend.
 * Route: GET /api/auth/menus  (consolidated in Menu module)
 */
export async function fetchMenuTreeService(): Promise<MenuTreeResponse> {
  return getData('/auth/menus')
}

/**
 * Fetch the role-filtered top-navigation menu tree (is_top_menu = true).
 * Route: GET /api/auth/top_menus
 */
export async function fetchTopMenuTreeService(): Promise<MenuTreeResponse> {
  return getData('/auth/top_menus')
}

/**
 * TanStack Query options for the menu tree.
 * The menu tree is fetched once per session (staleTime = 30 min)
 * since it only changes when roles/permissions are modified.
 */
export const menuTreeQueryOptions = () =>
  queryOptions({
    queryKey: [MENU_TREE_KEY],
    queryFn: fetchMenuTreeService,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  })

/**
 * TanStack Query options for the top-navigation menu tree.
 * Same session caching strategy as the sidebar menu tree.
 */
export const topMenuTreeQueryOptions = () =>
  queryOptions({
    queryKey: [TOP_MENU_TREE_KEY],
    queryFn: fetchTopMenuTreeService,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  })
