import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchStatusService,
  storeStatusService,
  updateStatusService,
} from './api'
import type { StatusForm } from './schema'

const Key = 'statuses'

export const statusQueryOptions = (key: string = Key) => {
  return queryOptions({
    queryKey: [key],
    queryFn: fetchStatusService,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

export function useStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StatusForm & { id?: number }) => {
      if (data.id) {
        // Update if id exists
        return await updateStatusService(data)
      }
      // Otherwise create
      return await storeStatusService(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Key] })
    },
    onError: (error) => {
      console.error('Status mutation failed:', error)
    },
  })
}
