import { queryOptions } from "@tanstack/react-query"
import { fetchStockCategoryService } from "./api"
const Key = "StockCategories"
export const stockCategoryQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchStockCategoryService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}