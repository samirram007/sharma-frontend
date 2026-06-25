import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchStockItemByIdService, fetchStockItemService, storeStockItemService, updateStockItemService } from "./api"
import type { StockItemForm } from "./schema"

const BASE_KEY = "stock_items"

export const stockItemQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchStockItemByIdService(id) : fetchStockItemService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

export function useStockItemMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: StockItemForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateStockItemService(data)
            }
            // Otherwise create
            return await storeStockItemService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("Stock Item mutation failed:", error)
        },
    })
}