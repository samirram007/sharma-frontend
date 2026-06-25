import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchDesignationService, storeDesignationService, updateDesignationService } from "./api"
import type { DesignationForm } from "./schema"
//queryOptions.ts
const Key = "designations"
export const designationQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchDesignationService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useDesignationMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: DesignationForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateDesignationService(data)
            }
            // Otherwise create
            return await storeDesignationService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("Designation mutation failed:", error)
        },
    })
}