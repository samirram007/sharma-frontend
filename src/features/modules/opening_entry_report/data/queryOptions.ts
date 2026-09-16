import { queryOptions } from '@tanstack/react-query'
import {
  fetchOpeningEntryGroupedByLedgerService,
  fetchOpeningEntryReportService,
  fetchOpeningStockReportService,
} from './api'
import type { OpeningStockReportParams } from './api'

const BASE_KEY = 'openingEntryReport'

export const openingEntryReportQueryOptions = (fiscalYearId: number) =>
  queryOptions({
    queryKey: [BASE_KEY, fiscalYearId],
    queryFn: () => fetchOpeningEntryReportService(fiscalYearId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!fiscalYearId && fiscalYearId > 0,
  })

export const groupedByLedgerQueryOptions = (fiscalYearId: number) =>
  queryOptions({
    queryKey: [BASE_KEY, 'grouped-by-ledger', fiscalYearId],
    queryFn: () => fetchOpeningEntryGroupedByLedgerService(fiscalYearId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

// Opening Stock report — the opening voucher's stock item-wise + godown-wise.
// Query key includes the filters so each godown/item combination caches
// separately (the backend filters server-side).
export const openingStockReportQueryOptions = (
  params?: OpeningStockReportParams,
) =>
  queryOptions({
    queryKey: [
      BASE_KEY,
      'opening-stock',
      params?.godownId ?? null,
      params?.itemId ?? null,
    ],
    queryFn: () => fetchOpeningStockReportService(params),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
