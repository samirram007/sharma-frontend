import { queryOptions } from '@tanstack/react-query'
import { fetchStockSummaryService } from './api'
const queryKey = 'StockSummary'
export const stockSummaryQueryOptions = (key: string = 'stock_in_hand') => {
  return queryOptions({
    queryKey: [queryKey, key],
    queryFn: () => fetchStockSummaryService(key),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours — heavy report, avoid repeated fetches per navigation
    retry: 1,
  })
}
