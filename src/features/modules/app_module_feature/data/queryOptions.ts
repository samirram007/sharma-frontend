import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AppModuleFeatureForm } from "../types/types"
import { deleteAppModuleFeatureService, fetchAppModuleFeatureByIdService, fetchAppModuleFeatureService, storeAppModuleFeatureService, updateAppModuleFeatureService } from "./api"
import { getData } from "@/utils/dataClient"
const Key = "AppModuleFeatures"
const BASE_KEY = "AppModuleFeatures"



export const appModuleFeatureRoleQueryOptions = (id?: number, moduleid?: number) => {

    return queryOptions({
        queryKey: id && moduleid ? [BASE_KEY, id, moduleid] : [BASE_KEY],
        queryFn: async () => {
            if (!id || !moduleid) {
                throw new Error("Both roleId and moduleId are required for this query.")
            }
            return await getData(`/role/${id}/module-features/${moduleid}`)
        },
        enabled: !!id && !!moduleid,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

export const appModuleFeatureQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () => {
            return id ? fetchAppModuleFeatureByIdService(id) : fetchAppModuleFeatureService()
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useAppModuleFeatureMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: AppModuleFeatureForm & { id?: number }) => {
            console.log("mutation Data", data)
            if (data.id) {
                // Update if id exists
                return await updateAppModuleFeatureService(data)
            }
            // Otherwise create
            return await storeAppModuleFeatureService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("AppModuleFeature mutation failed:", error)
        },
    })
}
export function useAppModuleFeatureDeleteMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            // console.log("Deleting feature id:", id)
            return await deleteAppModuleFeatureService({ id })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("AppModuleFeature mutation failed:", error)
        },
    }
    )
}