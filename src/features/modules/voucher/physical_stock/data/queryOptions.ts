import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchPhysicalStockByIdService,
  fetchPhysicalStockService,
  storePhysicalStockService,
  updatePhysicalStockService,
} from './api'
import {
  PhysicalStockVoucherListSchema,
  PHYSICAL_STOCK_VOUCHER_TYPE_ID,
} from './schema'

const BASE_KEY = 'physical-stock-vouchers'

export const PhysicalStockVoucherQueryOptions = () => {
  return queryOptions({
    queryKey: [BASE_KEY, 'list', PHYSICAL_STOCK_VOUCHER_TYPE_ID],
    queryFn: async () => {
      const response = await fetchPhysicalStockService()
      const parsed = PhysicalStockVoucherListSchema.parse(response?.data ?? [])
      return parsed.filter(
        (voucher) => voucher.voucherTypeId === PHYSICAL_STOCK_VOUCHER_TYPE_ID,
      )
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const PhysicalStockQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () =>
      id ? fetchPhysicalStockByIdService(id) : fetchPhysicalStockService(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

type PhysicalStockVoucherMutationPayload = {
  id?: number
  voucherDate: Date | string
  voucherNo?: string | null
  amount?: number | null
  remarks?: string | null
  module?: string | null
  referenceNo?: string | null
  referenceDate?: Date | string | null
  voucherTypeId?: number
  stockJournalId?: number | null
  stockJournal?: unknown
  party?: unknown
  partyLedger?: unknown
  transactionLedger?: unknown
  voucherDispatchDetail?: unknown
  voucherEntries?: Array<{
    id?: number | null
    voucherId?: number | null
    entryOrder: number
    accountLedgerId: number
    debit: number
    credit: number
    remarks?: string | null
  }>
}

export function usePhysicalStockVoucherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PhysicalStockVoucherMutationPayload) => {
      if (data.id) {
        return await updatePhysicalStockService(
          data as unknown as Record<string, unknown>,
        )
      }
      return await storePhysicalStockService(
        data as unknown as Record<string, unknown>,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Physical stock voucher mutation failed:', error)
    },
  })
}
