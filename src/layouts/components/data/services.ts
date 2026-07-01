import { queryOptions } from '@tanstack/react-query'
import { getData } from '@/utils/dataClient'
import type { MenuTreeResponse } from './menu-tree-types'

const MENU_TREE_KEY = 'MenuTree'

/**
 * Fetch the role-filtered hierarchical menu tree from the backend.
 */
export async function fetchMenuTreeService(): Promise<MenuTreeResponse> {
  return getData('/auth/menu')
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
