import { queryOptions } from '@tanstack/react-query'
import { fetchOpeningEntryGroupedByLedgerService, fetchOpeningEntryReportService } from './api'

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
