import { queryOptions } from '@tanstack/react-query'
import type { ManufacturingJournalReportParams } from './api'
import {
  fetchManufacturingJournalReport,
  fetchGroupedByStockItem,
  fetchGroupedByGodown,
  fetchGroupedByDate,
} from './api'

const Key = 'ManufacturingJournalReport'

export const manufacturingJournalReportQueryOptions = (
  params?: ManufacturingJournalReportParams,
) => {
  return queryOptions({
    queryKey: [Key, params],
    queryFn: () => fetchManufacturingJournalReport(params),
    staleTime: 1000 * 30,
    retry: 1,
  })
}

export const groupedByStockItemQueryOptions = () => {
  return queryOptions({
    queryKey: [Key, 'grouped-by-stock-item'],
    queryFn: () => fetchGroupedByStockItem(),
    staleTime: 1000 * 30,
    retry: 1,
  })
}

export const groupedByGodownQueryOptions = () => {
  return queryOptions({
    queryKey: [Key, 'grouped-by-godown'],
    queryFn: () => fetchGroupedByGodown(),
    staleTime: 1000 * 30,
    retry: 1,
  })
}

export const groupedByDateQueryOptions = () => {
  return queryOptions({
    queryKey: [Key, 'grouped-by-date'],
    queryFn: () => fetchGroupedByDate(),
    staleTime: 1000 * 30,
    retry: 1,
  })
}
