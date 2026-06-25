import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchCreditNoteByIdService,
    fetchCreditNoteService,
    storeCreditNoteService,
    updateCreditNoteService,
} from './api'
import {
    CreditNoteVoucherListSchema,
    CREDIT_NOTE_VOUCHER_TYPE_ID,
} from './schema'

const BASE_KEY = 'credit-note-vouchers'

export const CreditNoteVoucherQueryOptions = () => {
    return queryOptions({
        queryKey: [BASE_KEY, 'list', CREDIT_NOTE_VOUCHER_TYPE_ID],
        queryFn: async () => {
            const response = await fetchCreditNoteService()
            const parsed = CreditNoteVoucherListSchema.parse(response?.data ?? [])
            return parsed.filter(
                (voucher) => voucher.voucherTypeId === CREDIT_NOTE_VOUCHER_TYPE_ID
            )
        },
        staleTime: 1000 * 60,
        retry: 1,
    })
}

export const CreditNoteQueryOptions = (id?: number) => {
    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () => (id ? fetchCreditNoteByIdService(id) : fetchCreditNoteService()),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}

type CreditNoteVoucherMutationPayload = {
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

export function useCreditNoteVoucherMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreditNoteVoucherMutationPayload) => {
            if (data.id) {
                return await updateCreditNoteService(data as unknown as Record<string, unknown>)
            }
            return await storeCreditNoteService(data as unknown as Record<string, unknown>)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error('Credit note voucher mutation failed:', error)
        },
    })
}
