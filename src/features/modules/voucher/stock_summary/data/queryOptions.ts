import { queryOptions } from "@tanstack/react-query"
import { fetchStockSummaryService } from "./api"
const queryKey = "StockSummary"
export const stockSummaryQueryOptions = (key: string = 'stock_in_hand') => {

    return queryOptions({
        queryKey: [queryKey, key],
        queryFn: () => fetchStockSummaryService(key),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
