import {
    queryOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import {
    assignUserRoleService,
    fetchUserByIdService,
    fetchUserService,
    storeUserService,
    updateUserService,
} from './api'
import type { UserForm } from './schema'
import type { UserRole } from '../../role/data/schema'

const BASE_KEY = 'user'

export const userQueryOptions = (id?: number) => {
    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
      queryFn: () => (id ? fetchUserByIdService(id) : fetchUserService()),
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
  })
}

export function useUserMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: UserForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateUserService(data)
            }
            // Otherwise create
            return await storeUserService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
          console.error('User mutation failed:', error)
      },
  })
}

export function useUserRoleMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: UserRole) => {
            return await assignUserRoleService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error('User Role mutation failed:', error)
        },
    })
}