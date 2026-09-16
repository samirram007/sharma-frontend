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

export interface OpeningStockReportParams {
  godownId?: number | null
  itemId?: number | null
}

// Opening Stock report — the fiscal year's opening voucher stock (OPNSK),
// pre-grouped item-wise AND godown-wise by the backend in one payload.
// Optional server-side filters narrow the report to a single godown/item.
export async function fetchOpeningStockReportService(
  params?: OpeningStockReportParams,
) {
  const qp = new URLSearchParams()
  if (params?.godownId) qp.set('godown_id', String(params.godownId))
  if (params?.itemId) qp.set('item_id', String(params.itemId))
  const qs = qp.toString()
  return await getData(`stock_summaries/opening_stock${qs ? `?${qs}` : ''}`)
}
