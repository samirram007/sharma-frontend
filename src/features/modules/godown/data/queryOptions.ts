import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchGodownService, storeGodownService, updateGodownService } from "./api"
import type { GodownForm } from "./schema"
//queryOptions.ts
const Key = "godowns"
export const godownQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchGodownService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useGodownMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: GodownForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateGodownService(data)
            }
            // Otherwise create
            return await storeGodownService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("Godown mutation failed:", error)
        },
    })
}