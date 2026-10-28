import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchFreightByIdService,
  fetchFreightReportService,
  fetchFreightService,
  fetchDeliveryLockService,
  lockDeliveryService,
  storeFreightService,
  storeVoucherDispatchDetailService,
  unlockDeliveryService,
  updateFreightService,
  updateVoucherDispatchDetailService,
} from './api'
import type { DeliveryLockPayload } from './api'
import type { FreightForm } from './schema'
import type { VoucherDispatchDetailForm } from '../../stock_journal/data/schema'
import type { FreightQueryParams, DeliveryLockQueryParams } from './api'

const queryKey = 'Freight'
export const freightQueryOptions = (
  key: string = 'freight',
  id?: number,
  params?: FreightQueryParams,
) => {
  // Build a stable query key from the params so React Query re-fetches when filters change
  const queryParams = params ?? {}
  const queryKeyForFetch = id
    ? [queryKey, key, id]
    : [queryKey, key, queryParams]

  return queryOptions({
    queryKey: queryKeyForFetch,
    queryFn: () => {
      return id
        ? fetchFreightByIdService(key, id)
        : fetchFreightService(key, params)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

/**
 * Query options for the delivery-lock list — the small metadata table shown
 * when the Postponed-only filter is active. `GET /api/delivery_lock`.
 */
export const deliveryLockQueryOptions = (params?: DeliveryLockQueryParams) => {
  return queryOptions({
    queryKey: ['deliveryLock'],
    queryFn: () => fetchDeliveryLockService(params),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}
export const freightReportQueryOptions = (key: string = 'freight_report') => {
  return queryOptions({
    queryKey: ['FreightReport', key],
    queryFn: () => fetchFreightReportService(key),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

export const useFreightMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: FreightForm & { id?: number }) => {
      if (data.id) {
        // Update if id exists
        return await updateFreightService(data)
      }
      // Otherwise create
      return await storeFreightService(data)
    },
    onSuccess: () => {
      console.log('Hello Key', queryKey)
      queryClient.invalidateQueries({ queryKey: [queryKey] })
    },
    onError: (error) => {
      console.error('Transporter mutation failed:', error)
    },
  })
}
export const useVoucherDispatchDetailMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: VoucherDispatchDetailForm & { id?: number }) => {
      console.log('data', data)
      if (data.id) {
        // Update if id exists
        return await updateVoucherDispatchDetailService(data)
      }
      // Otherwise create
      return await storeVoucherDispatchDetailService(data)
    },
    onSuccess: () => {
      // Freight list AND the delivery-note queries (summary dialog, Day Book
      // card) — they all render the dispatch detail, so stale caches would
      // keep showing the pre-save state (e.g. an "estimated" weight).
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      queryClient.invalidateQueries({ queryKey: ['deliveryNote'] })
      queryClient.invalidateQueries({ queryKey: ['DayBooks'] })
    },
    onError: (error) => {
      console.error('Dispatch mutation failed:', error)
    },
  })
}

/**
 * Lock / unlock a delivery note (postpone) from the Freight grid.
 *
 * dataClient already toasts the API's success message and validation errors,
 * so this mutation must not toast again.
 */
export const useDeliveryLockMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      lock,
      payload,
    }: {
      id: number
      lock: boolean
      payload?: {
        reason?: string
        note?: string | null
        locked_at?: string | null
        unlocked_at?: string | null
      }
    }) => {
      if (!lock) {
        return await unlockDeliveryService(id, payload?.unlocked_at ?? null)
      }
      return await lockDeliveryService(id, payload as DeliveryLockPayload)
    },
    onSuccess: () => {
      // The Freight grid, the Day Book and the delivery-note summary dialog
      // all render the lock state, so every cache that shows it is stale.
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      queryClient.invalidateQueries({ queryKey: ['DayBooks'] })
      queryClient.invalidateQueries({ queryKey: ['deliveryNote'] })
    },
    onError: (error) => {
      console.error('Delivery lock mutation failed:', error)
    },
  })
}
