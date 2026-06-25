import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchRejectionInByIdService,
    fetchRejectionInService,
    storeRejectionInService,
    updateRejectionInService,
} from './api'
import {
    RejectionInVoucherListSchema,
    REJECTION_IN_VOUCHER_TYPE_ID,
} from './schema'

const BASE_KEY = 'rejection-in-vouchers'

export const RejectionInVoucherQueryOptions = () => {
    return queryOptions({
        queryKey: [BASE_KEY, 'list', REJECTION_IN_VOUCHER_TYPE_ID],
        queryFn: async () => {
            const response = await fetchRejectionInService()
            const parsed = RejectionInVoucherListSchema.parse(response?.data ?? [])
            return parsed.filter(
                (voucher) => voucher.voucherTypeId === REJECTION_IN_VOUCHER_TYPE_ID
            )
        },
        staleTime: 1000 * 60,
        retry: 1,
    })
}

export const RejectionInQueryOptions = (id?: number) => {
    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () => (id ? fetchRejectionInByIdService(id) : fetchRejectionInService()),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}

type RejectionInVoucherMutationPayload = {
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

export function useRejectionInVoucherMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: RejectionInVoucherMutationPayload) => {
            if (data.id) {
                return await updateRejectionInService(data as unknown as Record<string, unknown>)
            }
            return await storeRejectionInService(data as unknown as Record<string, unknown>)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error('Rejection in voucher mutation failed:', error)
        },
    })
}
