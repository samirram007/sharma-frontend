import { getData } from '@/utils/dataClient'

const API_PATH = '/stock_summaries'

/** Integrity filter values understood by the backend. */
export type BatchIssueFilter =
  | 'all'
  | 'ok'
  | 'carry_forward'
  | 'journal_variance'
  | 'negative'
  | 'no_movement'

export type BatchSortBy =
  | 'item'
  | 'batch'
  | 'godown'
  | 'opening'
  | 'inward'
  | 'outward'
  | 'closing'
  | 'value'
  | 'expiry'
  | 'activity'

export type BatchSortDir = 'asc' | 'desc'

export interface BatchBalancingParams {
  /** Free text against batch no / item name. */
  search?: string
  itemId?: number | null
  godownId?: number | null
  /** Exact batch number (wins over `search`). */
  batchNo?: string | null
  voucherTypeId?: number | null
  fromDate?: string | null
  toDate?: string | null
  inStockOnly?: boolean
  issue?: BatchIssueFilter
  sortBy?: BatchSortBy
  sortDir?: BatchSortDir
  /** 1-based batch page. */
  page?: number
  /** Batches per page — 'all' (or 0) returns everything. */
  perPage?: number | 'all'
  /** false skips the movement trail (balances only). */
  includeMovements?: boolean
}

function appendQueryParams(params?: BatchBalancingParams): string {
  const qp = new URLSearchParams()
  if (params?.search) qp.set('search', params.search)
  if (params?.itemId) qp.set('item_id', String(params.itemId))
  if (params?.godownId) qp.set('godown_id', String(params.godownId))
  if (params?.batchNo) qp.set('batch_no', params.batchNo)
  if (params?.voucherTypeId)
    qp.set('voucher_type_id', String(params.voucherTypeId))
  if (params?.fromDate) qp.set('from_date', params.fromDate)
  if (params?.toDate) qp.set('to_date', params.toDate)
  if (params?.inStockOnly) qp.set('in_stock_only', '1')
  if (params?.issue && params.issue !== 'all') qp.set('issue', params.issue)
  if (params?.sortBy) qp.set('sort_by', params.sortBy)
  if (params?.sortDir) qp.set('sort_dir', params.sortDir)
  if (params?.page) qp.set('page', String(params.page))
  if (params?.perPage != null) qp.set('per_page', String(params.perPage))
  if (params?.includeMovements === false) qp.set('include_movements', '0')
  const qs = qp.toString()
  return qs ? `?${qs}` : ''
}

// Batch Balancing report — per (item, godown, batch): opening / inward /
// outward / closing quantities with the full chronological movement list, a
// running balance, the valuation columns and the integrity flags. Every
// filter (plus sorting and paging) is applied server-side at the batch level,
// so the response is bounded no matter how large the ledger is.
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
