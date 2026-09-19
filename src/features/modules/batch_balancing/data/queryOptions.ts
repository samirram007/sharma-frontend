import { queryOptions } from '@tanstack/react-query'
import { fetchBatchListService, fetchBatchMovementsService } from './api'
import type { BatchBalancingParams } from './api'

const BASE_KEY = 'batchBalancing'

// The report query. The whole params object is part of the key (TanStack
// hashes it structurally), so every filter / sort / page combination caches
// separately without having to enumerate fields here. The report is only
// enabled once at least one criterion is set — see the page — which keeps a
// first paint from dumping the whole ledger.
export const batchBalancingQueryOptions = (params: BatchBalancingParams) =>
  queryOptions({
    queryKey: [BASE_KEY, 'movements', params],
    queryFn: () => fetchBatchMovementsService(params),
    staleTime: 1000 * 30,
    retry: 1,
  })

/**
 * Every matching batch, balances only — the ranked and pivot views rank and
 * pivot the whole filtered result set, not just the page the report happened to
 * load. Movements are skipped because those views never render a trail.
 */
export const batchBalancesQueryOptions = (params: BatchBalancingParams) =>
  queryOptions({
    queryKey: [BASE_KEY, 'balances', params],
    queryFn: () => fetchBatchMovementsService(params),
    staleTime: 1000 * 30,
    retry: 1,
  })

/**
 * One batch including its movement trail — fetched on demand when the inspector
 * is opened from a view that only loaded balances.
 */
export const batchDetailQueryOptions = (params: BatchBalancingParams) =>
  queryOptions({
    queryKey: [BASE_KEY, 'detail', params],
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
