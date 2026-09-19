import { queryOptions } from '@tanstack/react-query'
import {
  fetchBatchLifelineService,
  fetchLifelineBatchSuggestions,
} from './api'
import type { BatchLifelineParams } from './api'

const BASE_KEY = 'batchLifeline'

/**
 * One batch number's complete history. Disabled until a batch number is
 * chosen — the endpoint is always scoped to a single batch, never a dump.
 */
export const batchLifelineQueryOptions = (params: BatchLifelineParams) =>
  queryOptions({
    queryKey: [BASE_KEY, 'lifeline', params],
    queryFn: () => fetchBatchLifelineService(params),
    staleTime: 1000 * 30,
    retry: 1,
  })

/** Batch-number suggestions for the picker (debounced by the caller). */
export const lifelineBatchSuggestionsQueryOptions = (search?: string) =>
  queryOptions({
    queryKey: [BASE_KEY, 'suggestions', search ?? ''],
    queryFn: () => fetchLifelineBatchSuggestions(search),
    staleTime: 1000 * 60,
    retry: 1,
  })
