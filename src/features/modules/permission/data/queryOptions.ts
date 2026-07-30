import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchPermissionService, fetchFeaturesWithRolePermissionsService, storePermissionService, updatePermissionService } from "./api"
import type { PermissionForm } from "./schema"

const Key = "permissions"

export const permissionQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchPermissionService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

export const featuresWithRolePermissionsQueryOptions = (roleId?: number) => {
    return queryOptions({
        queryKey: [Key, 'role-features', roleId],
        queryFn: () => fetchFeaturesWithRolePermissionsService(roleId!),
        enabled: !!roleId,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}

export function usePermissionMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: PermissionForm & { id?: number }) => {
            if (data.id) {
                return await updatePermissionService(data)
            }
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
