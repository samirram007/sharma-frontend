import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { StockGroupForm } from '../types/types'
import {
  fetchStockGroupService,
  storeStockGroupService,
  updateStockGroupService,
} from './api'
const Key = 'StockGroups'

/**
 * Query options for the stock-group list.
 *
 * Pass a status ('active' | 'inactive' | 'all' | undefined) to scope the
 * fetch server-side. The default call (no status) keeps the historical
 * [Key] cache entry so shared consumers (dropdowns, toggle invalidation)
 * keep working; the page passes an explicit status so each filter gets its
 * own cache entry.
 */
export const stockGroupQueryOptions = (status?: string) => {
  const scoped = status && status !== 'all' ? status : null
  return queryOptions({
    queryKey: scoped ? [Key, scoped] : [Key],
    queryFn: () =>
      fetchStockGroupService(scoped ? { status: scoped } : undefined),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}
export function useStockGroupMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StockGroupForm & { id?: number }) => {
      console.log('mutation Data', data)
      if (data.id) {
        // Update if id exists
        return await updateStockGroupService(data)
      }
      // Otherwise create
      return await storeStockGroupService(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Key] })
    },
    onError: (error) => {
      console.error('StockGroup mutation failed:', error)
    },
  })
}
