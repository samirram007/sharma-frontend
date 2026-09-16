import { queryOptions } from '@tanstack/react-query'
import { fetchBatchListService, fetchBatchMovementsService } from './api'
import type { BatchBalancingParams } from './api'

const BASE_KEY = 'batchBalancing'

// The report query — every filter is part of the key so combinations cache
// separately. Enabled only when at least one criterion is set avoids a
// full-database dump on first paint.
export const batchBalancingQueryOptions = (params: BatchBalancingParams) =>
  queryOptions({
    queryKey: [
      BASE_KEY,
      'movements',
      params.search ?? '',
      params.itemId ?? null,
      params.godownId ?? null,
      params.batchNo ?? '',
      params.fromDate ?? null,
      params.toDate ?? null,
    ],
    queryFn: () => fetchBatchMovementsService(params),
    staleTime: 1000 * 30,
    retry: 1,
  })

export const batchSuggestionsQueryOptions = (
  search?: string,
  itemId?: number | null,
  godownId?: number | null,
) =>
  queryOptions({
    queryKey: [
      BASE_KEY,
      'suggestions',
      search ?? '',
      itemId ?? null,
      godownId ?? null,
    ],
    queryFn: () => fetchBatchListService(search, itemId, godownId),
    staleTime: 1000 * 60,
    retry: 1,
  })
