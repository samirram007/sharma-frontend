import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchOpeningBalanceSetupService,
  storeOpeningBalanceService,
  fetchOpeningBalanceStatusService,
} from './api'

const BASE_KEY = 'openingBalance'

export const openingBalanceSetupQueryOptions = () =>
  queryOptions({
    queryKey: [BASE_KEY, 'setupData'],
    queryFn: fetchOpeningBalanceSetupService,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

export const openingBalanceStatusQueryOptions = () =>
  queryOptions({
    queryKey: [BASE_KEY, 'status'],
    queryFn: fetchOpeningBalanceStatusService,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

export function useStoreOpeningBalanceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof storeOpeningBalanceService>[0]) =>
      storeOpeningBalanceService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
  })
}
