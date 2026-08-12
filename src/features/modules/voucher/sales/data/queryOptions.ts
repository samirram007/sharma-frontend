import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchSalesByIdService,
  fetchSalesService,
  storeSalesService,
  updateSalesService,
} from './api'
import { SalesVoucherListSchema, SALES_VOUCHER_TYPE_ID } from './schema'

const BASE_KEY = 'sales-vouchers'

export const SalesVoucherQueryOptions = () => {
  return queryOptions({
    queryKey: [BASE_KEY, 'list', SALES_VOUCHER_TYPE_ID],
    queryFn: async () => {
      const response = await fetchSalesService()
      const parsed = SalesVoucherListSchema.parse(response?.data ?? [])
      return parsed.filter(
        (voucher) => voucher.voucherTypeId === SALES_VOUCHER_TYPE_ID,
      )
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const SalesQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () => (id ? fetchSalesByIdService(id) : fetchSalesService()),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

type SalesVoucherMutationPayload = {
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

export function useSalesVoucherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SalesVoucherMutationPayload) => {
      if (data.id) {
        return await updateSalesService(
          data as unknown as Record<string, unknown>,
        )
      }
      return await storeSalesService(data as unknown as Record<string, unknown>)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Sales voucher mutation failed:', error)
    },
  })
}
