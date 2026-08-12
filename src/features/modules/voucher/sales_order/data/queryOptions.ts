import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchSalesOrderByIdService,
  fetchSalesOrderService,
  storeSalesOrderService,
  updateSalesOrderService,
} from './api'
import {
  salesOrderVoucherListSchema,
  SALES_ORDER_VOUCHER_TYPE_ID,
} from './schema'

const BASE_KEY = 'sales-order-vouchers'

export const salesOrderVoucherQueryOptions = () => {
  return queryOptions({
    queryKey: [BASE_KEY, 'list', SALES_ORDER_VOUCHER_TYPE_ID],
    queryFn: async () => {
      const response = await fetchSalesOrderService()
      const parsed = salesOrderVoucherListSchema.parse(response?.data ?? [])
      return parsed.filter(
        (voucher) => voucher.voucherTypeId === SALES_ORDER_VOUCHER_TYPE_ID,
      )
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const salesOrderQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () =>
      id ? fetchSalesOrderByIdService(id) : fetchSalesOrderService(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

type SalesOrderVoucherMutationPayload = {
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

export function useSalesOrderVoucherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SalesOrderVoucherMutationPayload) => {
      if (data.id) {
        return await updateSalesOrderService(
          data as unknown as Record<string, unknown>,
        )
      }
      return await storeSalesOrderService(
        data as unknown as Record<string, unknown>,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Sales order voucher mutation failed:', error)
    },
  })
}
