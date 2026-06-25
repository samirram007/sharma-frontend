import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchRoleByIdService, fetchRoleService, storeRoleService, updateRoleService } from "./api"
import type { RoleForm } from "./schema"
//queryOptions.ts
const BASE_KEY = "roles"
export const roleQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchRoleByIdService(id) : fetchRoleService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useRoleMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: RoleForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateRoleService(data)
            }
            // Otherwise create
            return await storeRoleService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("Role mutation failed:", error)
        },
    })
}