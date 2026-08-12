import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchTransporterByIdService,
  fetchTransporterService,
  storeTransporterService,
  updateTransporterService,
} from './api'
import type { TransporterForm } from './schema'

const BASE_KEY = 'transporter'

export const transporterQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () =>
      id ? fetchTransporterByIdService(id) : fetchTransporterService(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

export function useTransporterMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: TransporterForm & { id?: number }) => {
      if (data.id) {
        // Update if id exists
        return await updateTransporterService(data)
      }
      // Otherwise create
      return await storeTransporterService(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Transporter mutation failed:', error)
    },
  })
}
