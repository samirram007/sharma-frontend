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
            // A permission change affects every permission-filtered surface:
            // - ['MenuTree']        → role-filtered sidebar menu (staleTime 30 min)
            // - ['Menus']           → admin menu tree / lists
            // - ['MenuPermissions'] → Menu Manager shield toggles
            // - ['AppModuleFeatures'] → Role permission dialog badges
            // Invalidating all of them makes the change visible immediately
            // instead of after the menu tree's long staleTime expires.
            queryClient.invalidateQueries({ queryKey: ['MenuTree'] })
            queryClient.invalidateQueries({ queryKey: ['Menus'] })
            queryClient.invalidateQueries({ queryKey: ['MenuPermissions'] })
            queryClient.invalidateQueries({ queryKey: ['AppModuleFeatures'] })
        },
        onError: (error) => {
            console.error("Permission mutation failed:", error)
        },
    })
}
