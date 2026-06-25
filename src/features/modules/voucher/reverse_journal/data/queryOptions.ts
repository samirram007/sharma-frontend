import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchReverseJournalByIdService,
    fetchReverseJournalService,
    storeReverseJournalService,
    updateReverseJournalService,
} from './api'
import {
    REVERSE_JOURNAL_VOUCHER_TYPE_ID,
    reverseJournalVoucherListSchema,
} from './schema'

const BASE_KEY = 'reverse-journal-vouchers'

export const reverseJournalVoucherQueryOptions = () => {
    return queryOptions({
        queryKey: [BASE_KEY, 'list', REVERSE_JOURNAL_VOUCHER_TYPE_ID],
        queryFn: async () => {
            const response = await fetchReverseJournalService()
            const parsed = reverseJournalVoucherListSchema.parse(response?.data ?? [])
            return parsed.filter(
                (voucher) => voucher.voucherTypeId === REVERSE_JOURNAL_VOUCHER_TYPE_ID
            )
        },
        staleTime: 1000 * 60,
        retry: 1,
    })
}

export const reverseJournalQueryOptions = (id?: number) => {
    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () => (id ? fetchReverseJournalByIdService(id) : fetchReverseJournalService()),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}

type ReverseJournalVoucherMutationPayload = {
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

export function useReverseJournalVoucherMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: ReverseJournalVoucherMutationPayload) => {
            if (data.id) {
                return await updateReverseJournalService(data as unknown as Record<string, unknown>)
            }
            return await storeReverseJournalService(data as unknown as Record<string, unknown>)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error('Reverse journal voucher mutation failed:', error)
        },
    })
}
