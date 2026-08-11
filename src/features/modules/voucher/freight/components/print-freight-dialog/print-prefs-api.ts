import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getData, putData } from '@/utils/dataClient'

export interface PrintPreferences {
  showFareDetails: boolean
  showDocumentInfo: boolean
  showAuthorizations: boolean
  showPaidToAmount: boolean
}

interface PrefsResponse {
  success: boolean
  data: PrintPreferences | null
}

const PREFS_KEY = ['user', 'print-preferences'] as const

/**
 * Fetch the current user's print receipt section-visibility preferences.
 * Resolves to null when the user hasn't saved any preference yet, so the
 * client keeps its local (device) values until the first explicit save.
 */
export function usePrintPreferences() {
  return useQuery<PrintPreferences | null>({
    queryKey: PREFS_KEY,
    queryFn: async () => {
      const response: PrefsResponse = await getData('/user/print-preferences')
      return response.data ?? null
    },
    staleTime: 60_000,
    retry: 1,
  })
}

/**
 * Persist the current user's print section-visibility preferences so the
 * choice applies on every device.
 */
export function useUpdatePrintPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (preferences: PrintPreferences) => {
      return await putData('/user/print-preferences', {
        show_fare_details: preferences.showFareDetails,
        show_document_info: preferences.showDocumentInfo,
        show_authorizations: preferences.showAuthorizations,
        show_paid_to_amount: preferences.showPaidToAmount,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREFS_KEY })
    },
  })
}
