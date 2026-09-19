import { getData } from '@/utils/dataClient'

const API_PATH = '/stock_summaries'

export interface BatchLifelineParams {
  /** The batch number whose complete history is wanted (required). */
  batchNo: string
  itemId?: number | null
  godownId?: number | null
  fromDate?: string | null
  toDate?: string | null
  expiryWithinDays?: number
  /** Max lines returned by the backend (default 1000, capped at 5000). */
  limit?: number
  includeSnapshots?: boolean
}

function appendQueryParams(params: BatchLifelineParams): string {
  const qp = new URLSearchParams()
  qp.set('batch_no', params.batchNo)
  if (params.itemId) qp.set('item_id', String(params.itemId))
  if (params.godownId) qp.set('godown_id', String(params.godownId))
  if (params.fromDate) qp.set('from_date', params.fromDate)
  if (params.toDate) qp.set('to_date', params.toDate)
  if (params.expiryWithinDays)
    qp.set('expiry_within_days', String(params.expiryWithinDays))
  if (params.limit) qp.set('limit', String(params.limit))
  if (params.includeSnapshots === false) qp.set('include_snapshots', '0')
  return `?${qp.toString()}`
}

// Batch Lifeline — every stock-journal line ever booked against one batch
// number (any item, any godown, any fiscal year) in chronological order, with
// per-bucket running balances, fiscal-year markers + subtotals, opening
// restatements, closing-snapshot markers and godown transfers.
export async function fetchBatchLifelineService(params: BatchLifelineParams) {
  return await getData(`${API_PATH}/batch_lifeline${appendQueryParams(params)}`)
}

// Distinct batch numbers (with item/godown context) for the batch picker.
export async function fetchLifelineBatchSuggestions(search?: string) {
  const qp = new URLSearchParams()
  if (search) qp.set('search', search)
  const qs = qp.toString()
  return await getData(`${API_PATH}/batch_list${qs ? `?${qs}` : ''}`)
}
