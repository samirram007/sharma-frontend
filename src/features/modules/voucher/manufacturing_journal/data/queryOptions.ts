import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchManufacturingJournalByIdService,
    fetchManufacturingJournalService,
    storeManufacturingJournalService,
    updateManufacturingJournalService,
} from './api'
import {
    ManufacturingJournalVoucherListSchema,
    MANUFACTURING_JOURNAL_VOUCHER_TYPE_ID,
} from './schema'
import type { ManufacturingJournalVoucherForm } from './schema'

const BASE_KEY = 'manufacturing-journal-vouchers'

export const ManufacturingJournalVoucherQueryOptions = () => {
    return queryOptions({
        queryKey: [BASE_KEY, 'list', MANUFACTURING_JOURNAL_VOUCHER_TYPE_ID],
        queryFn: async () => {
            const response = await fetchManufacturingJournalService()
            const parsed = ManufacturingJournalVoucherListSchema.parse(response?.data ?? [])
            return parsed.filter(
                (voucher) => voucher.voucherTypeId === MANUFACTURING_JOURNAL_VOUCHER_TYPE_ID
            )
        },
        staleTime: 1000 * 60,
        retry: 1,
    })
}

export const ManufacturingJournalQueryOptions = (id?: number) => {
    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () => (id ? fetchManufacturingJournalByIdService(id) : fetchManufacturingJournalService()),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}

// Same contract as the Receipt Note / Delivery Note pipeline: the mutation
// accepts the full form values (with an optional id for updates).
type ManufacturingJournalVoucherMutationPayload = ManufacturingJournalVoucherForm & { id?: number }

export function useManufacturingJournalVoucherMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: ManufacturingJournalVoucherMutationPayload) => {
            if (data.id) {
                return await updateManufacturingJournalService(data as unknown as Record<string, unknown>)
            }
            return await storeManufacturingJournalService(data as unknown as Record<string, unknown>)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error('Manufacturing journal voucher mutation failed:', error)
        },
    })
}
