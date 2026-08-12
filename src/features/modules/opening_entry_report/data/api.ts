import { getData } from '@/utils/dataClient'

export async function fetchOpeningEntryReportService(fiscalYearId: number) {
  return await getData(`fiscal-years/${fiscalYearId}/opening-entry-report`)
}

export async function fetchOpeningEntryGroupedByLedgerService(
  fiscalYearId: number,
) {
  return await getData(
    `fiscal-years/${fiscalYearId}/opening-entry-report/grouped-by-ledger`,
  )
}
