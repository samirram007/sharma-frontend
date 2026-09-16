import { getData } from '@/utils/dataClient'

const API_PATH = '/stock_summaries'

export interface BatchBalancingParams {
  search?: string
  itemId?: number | null
  godownId?: number | null
  batchNo?: string | null
  fromDate?: string | null
  toDate?: string | null
}

function appendQueryParams(params?: BatchBalancingParams): string {
  const qp = new URLSearchParams()
  if (params?.search) qp.set('search', params.search)
  if (params?.itemId) qp.set('item_id', String(params.itemId))
  if (params?.godownId) qp.set('godown_id', String(params.godownId))
  if (params?.batchNo) qp.set('batch_no', params.batchNo)
  if (params?.fromDate) qp.set('from_date', params.fromDate)
  if (params?.toDate) qp.set('to_date', params.toDate)
  const qs = qp.toString()
  return qs ? `?${qs}` : ''
}

// Batch Balancing report — per (item, godown, batch): opening / inward /
// outward / closing quantities with the full chronological movement list
// and a running balance. Server-side filters narrow the result set. With a
// from/to window the backend rolls pre-window rows into Opening and reports
// movements inside the window only.
export async function fetchBatchMovementsService(
  params?: BatchBalancingParams,
) {
  return await getData(
    `${API_PATH}/batch_movements${appendQueryParams(params)}`,
  )
}

// Distinct batch numbers (with item/godown context) for the batch search
// suggestions. Narrowed by a search string (batch no or item name) and/or the
// currently selected item/godown so the suggestions match the chosen filters.
export async function fetchBatchListService(
  search?: string,
  itemId?: number | null,
  godownId?: number | null,
) {
  const qp = new URLSearchParams()
  if (search) qp.set('search', search)
  if (itemId) qp.set('item_id', String(itemId))
  if (godownId) qp.set('godown_id', String(godownId))
  const qs = qp.toString()
  return await getData(`${API_PATH}/batch_list${qs ? `?${qs}` : ''}`)
}
