import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchPurchaseOrderByIdService,
  fetchPurchaseOrderService,
  storePurchaseOrderService,
  updatePurchaseOrderService,
} from './api'
import {
  purchaseOrderVoucherListSchema,
  PURCHASE_ORDER_VOUCHER_TYPE_ID,
} from './schema'

const BASE_KEY = 'purchase-order-vouchers'

export const purchaseOrderVoucherQueryOptions = () => {
  return queryOptions({
    queryKey: [BASE_KEY, 'list', PURCHASE_ORDER_VOUCHER_TYPE_ID],
    queryFn: async () => {
      const response = await fetchPurchaseOrderService()
      const parsed = purchaseOrderVoucherListSchema.parse(response?.data ?? [])
      return parsed.filter(
        (voucher) => voucher.voucherTypeId === PURCHASE_ORDER_VOUCHER_TYPE_ID,
      )
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const purchaseOrderQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () =>
      id ? fetchPurchaseOrderByIdService(id) : fetchPurchaseOrderService(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

type PurchaseOrderVoucherMutationPayload = {
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

export function usePurchaseOrderVoucherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PurchaseOrderVoucherMutationPayload) => {
      if (data.id) {
        return await updatePurchaseOrderService(
          data as unknown as Record<string, unknown>,
        )
      }
      return await storePurchaseOrderService(
        data as unknown as Record<string, unknown>,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Purchase order voucher mutation failed:', error)
    },
  })
}
