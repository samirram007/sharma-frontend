import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchConversionJournalByIdService,
    fetchConversionJournalService,
    storeConversionJournalService,
    updateConversionJournalService,
} from './api'
import {
    ConversionJournalVoucherListSchema,
    CONVERSION_JOURNAL_VOUCHER_TYPE_ID,
} from './schema'
import type { ConversionJournalVoucherForm } from './schema'

const BASE_KEY = 'conversion-journal-vouchers'

export const ConversionJournalVoucherQueryOptions = () => {
    return queryOptions({
        queryKey: [BASE_KEY, 'list', CONVERSION_JOURNAL_VOUCHER_TYPE_ID],
        queryFn: async () => {
            const response = await fetchConversionJournalService()
            const parsed = ConversionJournalVoucherListSchema.parse(response?.data ?? [])
            return parsed.filter(
                (voucher) => voucher.voucherTypeId === CONVERSION_JOURNAL_VOUCHER_TYPE_ID
            )
        },
        staleTime: 1000 * 60,
        retry: 1,
    })
}

export const ConversionJournalQueryOptions = (id?: number) => {
    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () => (id ? fetchConversionJournalByIdService(id) : fetchConversionJournalService()),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}

// Same contract as the Manufacturing Journal pipeline: the mutation
// accepts the full form values (with an optional id for updates).
type ConversionJournalVoucherMutationPayload = ConversionJournalVoucherForm & { id?: number }

export function useConversionJournalVoucherMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: ConversionJournalVoucherMutationPayload) => {
            if (data.id) {
                return await updateConversionJournalService(data as unknown as Record<string, unknown>)
            }
            return await storeConversionJournalService(data as unknown as Record<string, unknown>)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error('Conversion journal voucher mutation failed:', error)
        },
    })
}
