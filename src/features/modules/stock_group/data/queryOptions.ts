import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { StockGroupForm } from "../types/types"
import { fetchStockGroupService, storeStockGroupService, updateStockGroupService } from "./api"
const Key = "StockGroups"
export const stockGroupQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchStockGroupService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useStockGroupMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: StockGroupForm & { id?: number }) => {
            console.log("mutation Data", data)
            if (data.id) {
                // Update if id exists
                return await updateStockGroupService(data)
            }
            // Otherwise create
            return await storeStockGroupService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("StockGroup mutation failed:", error)
        },
    })
}