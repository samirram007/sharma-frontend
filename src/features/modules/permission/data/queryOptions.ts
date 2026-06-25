import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchPermissionService, storePermissionService, updatePermissionService } from "./api"
import type { PermissionForm } from "./schema"
//queryOptions.ts
const Key = "permissions"
export const permissionQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchPermissionService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function usePermissionMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: PermissionForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updatePermissionService(data)
            }
            // Otherwise create
            return await storePermissionService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("Permission mutation failed:", error)
        },
    })
}