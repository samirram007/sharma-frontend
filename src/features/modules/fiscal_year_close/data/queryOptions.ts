import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  closeFiscalYearService,
  fetchClosePreviewService,
  reopenFiscalYearService,
} from './api'

const BASE_KEY = 'fiscalYearClose'

export const closePreviewQueryOptions = (fiscalYearId: number) =>
  queryOptions({
    queryKey: [BASE_KEY, 'preview', fiscalYearId],
    queryFn: () => fetchClosePreviewService(fiscalYearId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

export function useCloseFiscalYearMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fiscalYearId: number) => closeFiscalYearService(fiscalYearId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
      queryClient.invalidateQueries({ queryKey: ['fiscalYears'] })
    },
  })
}

export function useReopenFiscalYearMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fiscalYearId: number) => reopenFiscalYearService(fiscalYearId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
      queryClient.invalidateQueries({ queryKey: ['fiscalYears'] })
    },
  })
}
