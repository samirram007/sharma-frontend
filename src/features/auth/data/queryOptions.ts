import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { changePasswordService } from '../services/apis'

const Key = 'AUTH'
export const authQueryOptions = (key: string = Key) => {
  return queryOptions({
    queryKey: [key],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      return await changePasswordService(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Key] })
    },
    onError: (error) => {
      console.error('Change password mutation failed:', error)
    },
  })
}
