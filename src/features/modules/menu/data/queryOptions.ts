import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { MenuForm } from '../types/types'
import {
  batchDeleteMenuService,
  batchUpdateMenuService,
  deleteMenuService,
  duplicateMenuService,
  fetchMenuByIdService,
  fetchMenuService,
  fetchMenuTreeService,
  patchMenuService,
  reorderMenuService,
  searchMenuService,
  storeMenuService,
  updateMenuService,
} from './api'

const BASE_KEY = 'Menus'

export const MenuQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () => (id ? fetchMenuByIdService(id) : fetchMenuService()),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/** Query options for the hierarchical menu tree. */
export const MenuTreeQueryOptions = queryOptions({
  queryKey: [BASE_KEY, 'tree'],
  queryFn: () => fetchMenuTreeService(),
  staleTime: 1000 * 60 * 5,
  retry: 1,
})

export function useMenuMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MenuForm & { id?: number }) => {
      if (data.id) {
        return await updateMenuService(data)
      }
      return await storeMenuService(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Menu mutation failed:', error)
    },
  })
}

export function useMenuDeleteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteMenuService({ id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Menu delete failed:', error)
    },
  })
}

export function useMenuReorderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      items: { id: number; sort_order: number; parent_id?: number | null }[],
    ) => {
      return await reorderMenuService(items)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Menu reorder failed:', error)
    },
  })
}

/** Quick inline update mutation — for toggling visibility/status, renaming inline. */
export function useMenuQuickUpdateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: { id: number } & Record<string, unknown>) => {
      // Convert camelCase payload keys to snake_case for the API
      const payload: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(fields)) {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
        payload[snakeKey] = value
      }
      return await patchMenuService(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Menu quick update failed:', error)
    },
  })
}

/** Batch mutation for toggling visibility/status on multiple items. */
export function useMenuBatchUpdateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ids,
      data,
    }: {
      ids: number[]
      data: Record<string, unknown>
    }) => {
      // Convert camelCase keys to snake_case for the API
      const payload: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data)) {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
        payload[snakeKey] = value
      }
      return await batchUpdateMenuService(ids, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Menu batch update failed:', error)
    },
  })
}

/** Batch mutation for deleting multiple items. */
export function useMenuBatchDeleteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      return await batchDeleteMenuService(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Menu batch delete failed:', error)
    },
  })
}

/** Duplicate a menu entry and all its children. */
export function useMenuDuplicateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await duplicateMenuService(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Menu duplicate failed:', error)
    },
  })
}

/** Server-side search query options with debounce-friendly key. */
export const MenuSearchQueryOptions = (search: string, perPage = 20) =>
  queryOptions({
    queryKey: [BASE_KEY, 'search', search, perPage],
    queryFn: () => searchMenuService(search, perPage),
    staleTime: 1000 * 30,
    enabled: search.length >= 2,
  })
