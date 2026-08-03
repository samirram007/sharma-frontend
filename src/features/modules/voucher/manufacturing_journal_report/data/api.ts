import { getData } from '@/utils/dataClient'

const API_PATH = '/manufacturing_journal_report'

export interface ManufacturingJournalReportParams {
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_order?: string
}

function appendQueryParams(params?: ManufacturingJournalReportParams): string {
  const qp = new URLSearchParams()
  if (params?.page) qp.set('page', String(params.page))
  if (params?.per_page) qp.set('per_page', String(params.per_page))
  if (params?.search) qp.set('search', params.search)
  if (params?.sort_by) qp.set('sort_by', params.sort_by)
  if (params?.sort_order) qp.set('sort_order', params.sort_order)
  const qs = qp.toString()
  return qs ? `?${qs}` : ''
}

export async function fetchManufacturingJournalReport(
  params?: ManufacturingJournalReportParams,
) {
  return await getData(`${API_PATH}${appendQueryParams(params)}`)
}

export async function fetchGroupedByStockItem() {
  return await getData(`${API_PATH}/grouped-by-stock-item`)
}

export async function fetchGroupedByGodown() {
  return await getData(`${API_PATH}/grouped-by-godown`)
}

export async function fetchGroupedByDate() {
  return await getData(`${API_PATH}/grouped-by-date`)
}
