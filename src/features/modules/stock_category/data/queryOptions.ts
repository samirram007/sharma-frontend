import { queryOptions } from '@tanstack/react-query'
import { fetchStockCategoryService } from './api'

/** Single source of truth for the list query key — mutations must invalidate
 * with this exact key (a plural/singular mismatch silently skips refetching,
 * so saved changes appear to never apply). */
export const StockCategoryListKey = 'StockCategories'

export const stockCategoryQueryOptions = (
  key: string = StockCategoryListKey,
) => {
  return queryOptions({
    queryKey: [key],
    queryFn: fetchStockCategoryService,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}
