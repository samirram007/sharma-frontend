import { Route as ConversionJournalReportRoute } from '@/routes/_protected/reports/conversion_journal_report/index'
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getServerErrorMessage } from '@/utils/handle-server-error'
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
      const parsed = ConversionJournalVoucherListSchema.parse(
        response?.data ?? [],
      )
      return parsed.filter(
        (voucher) =>
          voucher.voucherTypeId === CONVERSION_JOURNAL_VOUCHER_TYPE_ID,
      )
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const ConversionJournalQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () =>
      id
        ? fetchConversionJournalByIdService(id)
        : fetchConversionJournalService(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Same contract as the Manufacturing Journal pipeline: the mutation
// accepts the full form values (with an optional id for updates).
type ConversionJournalVoucherMutationPayload = ConversionJournalVoucherForm & {
  id?: number
}

export function useConversionJournalVoucherMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: ConversionJournalVoucherMutationPayload) => {
      if (data.id) {
        return await updateConversionJournalService(
          data as unknown as Record<string, unknown>,
        )
      }
      return await storeConversionJournalService(
        data as unknown as Record<string, unknown>,
      )
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
      // Keep the day book listing fresh so the new voucher shows
      // immediately.
      queryClient.invalidateQueries({ queryKey: ['DayBooks'] })
      toast.success(
        variables.id
          ? 'Conversion journal updated successfully'
          : 'Conversion journal saved successfully',
      )
      // Only redirect to the report when creating a new voucher — stay on
      // the page when editing an existing one.
      if (!variables.id) {
        navigate({ to: ConversionJournalReportRoute.to })
      }
    },
    onError: (error) => {
      console.error('Conversion journal voucher mutation failed:', error)
      toast.error(
        getServerErrorMessage(
          error,
          'Failed to save conversion journal voucher.',
        ),
      )
    },
  })
}
