import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchFaqByIdService,
  fetchFaqService,
  storeFaqService,
  updateFaqService,
} from './api'
import type { FaqForm } from './schema'

const BASE_KEY = 'faqs'

export const faqQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () => (id ? fetchFaqByIdService(id) : fetchFaqService()),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

export function useFaqMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: FaqForm & { id?: number }) => {
      if (data.id) {
        return await updateFaqService(data)
      }
      return await storeFaqService(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('FAQ mutation failed:', error)
    },
  })
}
