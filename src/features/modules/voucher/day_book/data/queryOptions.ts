import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { DayBookForm } from '../types/types'
import type { DayBookParams } from './api'
import {
  fetchDayBookSelfService,
  fetchDayBookService,
  storeDayBookService,
  updateDayBookService,
} from './api'

const Key = 'DayBooks'
export const dayBookQueryOptions = (params?: DayBookParams) => {
  return queryOptions({
    queryKey: [Key, params],
    queryFn: () => fetchDayBookService(params),
    staleTime: 1000 * 30, // 30 seconds
    retry: 1,
  })
}
export const dayBookSelfQueryOptions = (params?: DayBookParams) => {
  return queryOptions({
    queryKey: [Key, 'self', params],
    queryFn: () => fetchDayBookSelfService(params),
    staleTime: 1000 * 30, // 30 seconds
    retry: 1,
  })
}

export function useDayBookMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: DayBookForm & { id?: number }) => {
      if (data.id) {
        return await updateDayBookService(data)
      }
      return await storeDayBookService(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Key] })
    },
    onError: (error) => {
      console.error('DayBook mutation failed:', error)
    },
  })
}
