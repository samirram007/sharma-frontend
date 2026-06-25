import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchTransferVoucherByIdService,
    fetchTransferVoucherService,
    storeTransferVoucherService,
    updateTransferVoucherService,
} from './api'
import {
    TransferVoucherVoucherListSchema,
    TRANSFER_VOUCHER_VOUCHER_TYPE_ID,
} from './schema'

const BASE_KEY = 'transfer-voucher-vouchers'

export const TransferVoucherVoucherQueryOptions = () => {
    return queryOptions({
        queryKey: [BASE_KEY, 'list', TRANSFER_VOUCHER_VOUCHER_TYPE_ID],
        queryFn: async () => {
            const response = await fetchTransferVoucherService()
            const parsed = TransferVoucherVoucherListSchema.parse(response?.data ?? [])
            return parsed.filter(
                (voucher) => voucher.voucherTypeId === TRANSFER_VOUCHER_VOUCHER_TYPE_ID
            )
        },
        staleTime: 1000 * 60,
        retry: 1,
    })
}

export const TransferVoucherQueryOptions = (id?: number) => {
    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () => (id ? fetchTransferVoucherByIdService(id) : fetchTransferVoucherService()),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}

type TransferVoucherVoucherMutationPayload = {
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

export function useTransferVoucherVoucherMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: TransferVoucherVoucherMutationPayload) => {
            if (data.id) {
                return await updateTransferVoucherService(data as unknown as Record<string, unknown>)
            }
            return await storeTransferVoucherService(data as unknown as Record<string, unknown>)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error('Transfer voucher voucher mutation failed:', error)
        },
    })
}
