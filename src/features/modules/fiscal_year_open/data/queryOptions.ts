import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchOpenPreviewService, openFiscalYearService } from './api'

const BASE_KEY = 'fiscalYearOpen'

export const openPreviewQueryOptions = (newFiscalYearId: number, previousFiscalYearId: number) =>
  queryOptions({
    queryKey: [BASE_KEY, 'preview', newFiscalYearId, previousFiscalYearId],
    queryFn: () => fetchOpenPreviewService(newFiscalYearId, previousFiscalYearId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

export function useOpenFiscalYearMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      newFiscalYearId,
      previousFiscalYearId,
    }: {
      newFiscalYearId: number
      previousFiscalYearId: number
    }) => openFiscalYearService(newFiscalYearId, previousFiscalYearId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
      queryClient.invalidateQueries({ queryKey: ['fiscalYears'] })
      queryClient.invalidateQueries({ queryKey: ['userFiscalYears'] })
    },
  })
}
