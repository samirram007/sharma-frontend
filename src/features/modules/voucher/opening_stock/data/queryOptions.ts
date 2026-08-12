import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchOpeningStockByIdService,
  fetchOpeningStockService,
  fetchOpeningStockVoucherTypeService,
  storeOpeningStockService,
  updateOpeningStockService,
} from './api'
import {
  OPENING_STOCK_VOUCHER_TYPE_CODE,
  OpeningStockVoucherListSchema,
} from './schema'
import type { OpeningStockVoucherForm, OpeningStockVoucherType } from './schema'

const BASE_KEY = 'opening-stock-vouchers'
const OPENING_STOCK_TYPE_KEY = [BASE_KEY, 'voucher-type'] as const

// The OPNSK voucher type id is resolved from the backend (never hardcoded —
// it differs across databases). staleTime: Infinity since the id only changes
// with a reseed.
export const openingStockVoucherTypeQueryOptions = () => {
  return queryOptions({
    queryKey: OPENING_STOCK_TYPE_KEY,
    queryFn: async () => {
      const response = await fetchOpeningStockVoucherTypeService()
      // Hard invariant: this endpoint must return the OPNSK type — the list
      // filter and save payload both rely on it. Fail loudly instead of
      // silently filtering/saving under a wrong type id.
      if (response?.data?.code !== OPENING_STOCK_VOUCHER_TYPE_CODE) {
        throw new Error(
          `Unexpected voucher type from opening-stock/voucher-type: expected ${OPENING_STOCK_VOUCHER_TYPE_CODE}`,
        )
      }
      return response
    },
    staleTime: Infinity,
    retry: 1,
  })
}

export const OpeningStockVoucherQueryOptions = (
  openingStockTypeId?: number,
) => {
  return queryOptions({
    queryKey: [BASE_KEY, 'list', openingStockTypeId],
    queryFn: async () => {
      // Server-side filter by the resolved OPNSK type id — avoids loading the
      // entire voucher table (memory-heavy on large datasets).
      const response = await fetchOpeningStockService(openingStockTypeId)
      const parsed = OpeningStockVoucherListSchema.parse(response?.data ?? [])
      if (!openingStockTypeId) return []
      return parsed.filter(
        (voucher) => voucher.voucherTypeId === openingStockTypeId,
      )
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const OpeningStockQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () =>
      id ? fetchOpeningStockByIdService(id) : fetchOpeningStockService(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Same contract as the Conversion Journal pipeline: the mutation accepts the
// full form values (with an optional id for updates).
type OpeningStockVoucherMutationPayload = OpeningStockVoucherForm & {
  id?: number
}

export function useOpeningStockVoucherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: OpeningStockVoucherMutationPayload) => {
      // Stamp the OPNSK voucher type id resolved from the backend so saves
      // always carry the id that exists in THIS database. ensureQueryData
      // awaits the fetch when the type hasn't resolved yet, so a save can
      // never go out with a null/missing type id. (Inline options share the
      // same query key, so the cached type query is reused when available.)
      const typeEnvelope = await queryClient.ensureQueryData<{
        data?: OpeningStockVoucherType
      }>({
        queryKey: OPENING_STOCK_TYPE_KEY,
        queryFn: () => fetchOpeningStockVoucherTypeService(),
        staleTime: Infinity,
      })
      const voucherTypeId = typeEnvelope?.data?.id ?? data.voucherTypeId

      const payload = { ...data, voucherTypeId }

      if (data.id) {
        return await updateOpeningStockService(
          payload as unknown as Record<string, unknown>,
        )
      }
      return await storeOpeningStockService(
        payload as unknown as Record<string, unknown>,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Opening stock voucher mutation failed:', error)
    },
  })
}
