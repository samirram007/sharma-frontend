import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStockUnitService, storeStockUnitService, updateStockUnitService } from "./api";
import type { StockUnit } from "./schema";
const Key = "StockUnits"
const BASE_KEY = "stock_units"
export const stockUnitQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchStockUnitService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

export const useStockUnitMutation = () => {
    const queryClient = useQueryClient() 
    return useMutation({
        mutationFn: async (data: StockUnit & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateStockUnitService(data)
            }
            // Otherwise create
            return await storeStockUnitService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("Stock Item mutation failed:", error)
        },
    })
}