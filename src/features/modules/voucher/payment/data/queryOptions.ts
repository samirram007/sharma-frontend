import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  deletePaymentService,
  fetchPaymentByIdService,
  fetchPaymentService,
  storePaymentService,
  updatePaymentService,
} from './api'
import { PAYMENT_VOUCHER_TYPE_ID, paymentVoucherListSchema } from './schema'

const BASE_KEY = 'payment-vouchers'

export const paymentVoucherQueryOptions = () => {
  return queryOptions({
    queryKey: [BASE_KEY, 'list', PAYMENT_VOUCHER_TYPE_ID],
    queryFn: async () => {
      const response = await fetchPaymentService()
      const parsed = paymentVoucherListSchema.parse(response?.data ?? [])
      return parsed.filter(
        (voucher) => voucher.voucherTypeId === PAYMENT_VOUCHER_TYPE_ID,
      )
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const paymentQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () => (id ? fetchPaymentByIdService(id) : fetchPaymentService()),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

type PaymentVoucherMutationPayload = {
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

export function usePaymentVoucherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PaymentVoucherMutationPayload) => {
      if (data.id) {
        return await updatePaymentService(
          data as unknown as Record<string, unknown>,
        )
      }
      return await storePaymentService(
        data as unknown as Record<string, unknown>,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Payment voucher mutation failed:', error)
    },
  })
}

export function usePaymentVoucherDeleteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await deletePaymentService(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Payment voucher delete failed:', error)
    },
  })
}
