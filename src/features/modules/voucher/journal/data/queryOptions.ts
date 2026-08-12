import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchJournalByIdService,
  fetchJournalService,
  storeJournalService,
  updateJournalService,
} from './api'
import { JOURNAL_VOUCHER_TYPE_ID, journalVoucherListSchema } from './schema'

const BASE_KEY = 'journal-vouchers'

export const journalVoucherQueryOptions = () => {
  return queryOptions({
    queryKey: [BASE_KEY, 'list', JOURNAL_VOUCHER_TYPE_ID],
    queryFn: async () => {
      const response = await fetchJournalService()
      const parsed = journalVoucherListSchema.parse(response?.data ?? [])
      return parsed.filter(
        (voucher) => voucher.voucherTypeId === JOURNAL_VOUCHER_TYPE_ID,
      )
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const journalQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () => (id ? fetchJournalByIdService(id) : fetchJournalService()),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

type JournalVoucherMutationPayload = {
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

export function useJournalVoucherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: JournalVoucherMutationPayload) => {
      if (data.id) {
        return await updateJournalService(
          data as unknown as Record<string, unknown>,
        )
      }
      return await storeJournalService(
        data as unknown as Record<string, unknown>,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Journal voucher mutation failed:', error)
    },
  })
}
