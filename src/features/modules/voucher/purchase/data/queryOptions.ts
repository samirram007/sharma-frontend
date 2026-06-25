import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchPurchaseByIdService,
    fetchPurchaseService,
    storePurchaseService,
    updatePurchaseService,
} from './api'
import {
    PurchaseVoucherListSchema,
    PURCHASE_VOUCHER_TYPE_ID,
} from './schema'

const BASE_KEY = 'purchase-vouchers'

export const PurchaseVoucherQueryOptions = () => {
    return queryOptions({
        queryKey: [BASE_KEY, 'list', PURCHASE_VOUCHER_TYPE_ID],
        queryFn: async () => {
            const response = await fetchPurchaseService()
            const parsed = PurchaseVoucherListSchema.parse(response?.data ?? [])
            return parsed.filter(
                (voucher) => voucher.voucherTypeId === PURCHASE_VOUCHER_TYPE_ID
            )
        },
        staleTime: 1000 * 60,
        retry: 1,
    })
}

export const PurchaseQueryOptions = (id?: number) => {
    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () => (id ? fetchPurchaseByIdService(id) : fetchPurchaseService()),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}

type PurchaseVoucherMutationPayload = {
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

export function usePurchaseVoucherMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: PurchaseVoucherMutationPayload) => {
            if (data.id) {
                return await updatePurchaseService(data as unknown as Record<string, unknown>)
            }
            return await storePurchaseService(data as unknown as Record<string, unknown>)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error('Purchase voucher mutation failed:', error)
        },
    })
}

