import { queryOptions } from '@tanstack/react-query'
import type { ConversionJournalReportParams } from './api'
import {
  fetchConversionJournalReport,
  fetchGroupedByStockItem,
  fetchGroupedByGodown,
  fetchGroupedByDate,
} from './api'

const Key = 'ConversionJournalReport'

export const conversionJournalReportQueryOptions = (
  params?: ConversionJournalReportParams,
) => {
  return queryOptions({
    queryKey: [Key, params],
    queryFn: () => fetchConversionJournalReport(params),
    staleTime: 1000 * 30,
    retry: 1,
  })
}

export const groupedByStockItemQueryOptions = (stockJournalType?: string) => {
  return queryOptions({
    queryKey: [Key, 'grouped-by-stock-item', stockJournalType ?? ''],
    queryFn: () => fetchGroupedByStockItem(stockJournalType),
    staleTime: 1000 * 30,
    retry: 1,
  })
}

export const groupedByGodownQueryOptions = (stockJournalType?: string) => {
  return queryOptions({
    queryKey: [Key, 'grouped-by-godown', stockJournalType ?? ''],
    queryFn: () => fetchGroupedByGodown(stockJournalType),
    staleTime: 1000 * 30,
    retry: 1,
  })
}

export const groupedByDateQueryOptions = (stockJournalType?: string) => {
  return queryOptions({
    queryKey: [Key, 'grouped-by-date', stockJournalType ?? ''],
    queryFn: () => fetchGroupedByDate(stockJournalType),
    staleTime: 1000 * 30,
    retry: 1,
  })
}
