import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AppModuleForm } from "../types/types"
import { fetchAppModuleService, storeAppModuleService, updateAppModuleService } from "./api"
const Key = "AppModules"
export const appModuleQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchAppModuleService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useAppModuleMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: AppModuleForm & { id?: number }) => {
            console.log("mutation Data", data)
            if (data.id) {
                // Update if id exists
                return await updateAppModuleService(data)
            }
            // Otherwise create
            return await storeAppModuleService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("AppModule mutation failed:", error)
        },
    })
}