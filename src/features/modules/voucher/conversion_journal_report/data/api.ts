import { getData } from '@/utils/dataClient'

const API_PATH = '/conversion_journal_report'

export interface ConversionJournalReportParams {
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_order?: string
  stock_journal_type?: string
}

function appendQueryParams(params?: ConversionJournalReportParams): string {
  const qp = new URLSearchParams()
  if (params?.page) qp.set('page', String(params.page))
  if (params?.per_page) qp.set('per_page', String(params.per_page))
  if (params?.search) qp.set('search', params.search)
  if (params?.sort_by) qp.set('sort_by', params.sort_by)
  if (params?.sort_order) qp.set('sort_order', params.sort_order)
  if (params?.stock_journal_type)
    qp.set('stock_journal_type', params.stock_journal_type)
  const qs = qp.toString()
  return qs ? `?${qs}` : ''
}

export async function fetchConversionJournalReport(
  params?: ConversionJournalReportParams,
) {
  return await getData(`${API_PATH}${appendQueryParams(params)}`)
}

export async function fetchGroupedByStockItem(stockJournalType?: string) {
  return await getData(
    `${API_PATH}/grouped-by-stock-item${appendQueryParams({ stock_journal_type: stockJournalType })}`,
  )
}

export async function fetchGroupedByGodown(stockJournalType?: string) {
  return await getData(
    `${API_PATH}/grouped-by-godown${appendQueryParams({ stock_journal_type: stockJournalType })}`,
  )
}

export async function fetchGroupedByDate(stockJournalType?: string) {
  return await getData(
    `${API_PATH}/grouped-by-date${appendQueryParams({ stock_journal_type: stockJournalType })}`,
  )
}
