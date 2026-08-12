import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchDebitNoteByIdService,
  fetchDebitNoteService,
  storeDebitNoteService,
  updateDebitNoteService,
} from './api'
import {
  DebitNoteVoucherListSchema,
  DEBIT_NOTE_VOUCHER_TYPE_ID,
} from './schema'

const BASE_KEY = 'debit-note-vouchers'

export const DebitNoteVoucherQueryOptions = () => {
  return queryOptions({
    queryKey: [BASE_KEY, 'list', DEBIT_NOTE_VOUCHER_TYPE_ID],
    queryFn: async () => {
      const response = await fetchDebitNoteService()
      const parsed = DebitNoteVoucherListSchema.parse(response?.data ?? [])
      return parsed.filter(
        (voucher) => voucher.voucherTypeId === DEBIT_NOTE_VOUCHER_TYPE_ID,
      )
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const DebitNoteQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () =>
      id ? fetchDebitNoteByIdService(id) : fetchDebitNoteService(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

type DebitNoteVoucherMutationPayload = {
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

export function useDebitNoteVoucherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: DebitNoteVoucherMutationPayload) => {
      if (data.id) {
        return await updateDebitNoteService(
          data as unknown as Record<string, unknown>,
        )
      }
      return await storeDebitNoteService(
        data as unknown as Record<string, unknown>,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Debit note voucher mutation failed:', error)
    },
  })
}
