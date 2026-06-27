import { queryOptions } from "@tanstack/react-query"
import type { ReceiptNoteReportParams } from "./api"
import { fetchReceiptNoteReport, fetchGroupedByLedger, fetchGroupedByStockItem, fetchGroupedByGodown, fetchGroupedByDate } from "./api"

const Key = "ReceiptNoteReport"

export const receiptNoteReportQueryOptions = (params?: ReceiptNoteReportParams) => {
  return queryOptions({
    queryKey: [Key, params],
    queryFn: () => fetchReceiptNoteReport(params),
    staleTime: 1000 * 30,
    retry: 1,
  })
}

export const groupedByLedgerQueryOptions = () => {
  return queryOptions({
    queryKey: [Key, 'grouped-by-ledger'],
    queryFn: () => fetchGroupedByLedger(),
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
