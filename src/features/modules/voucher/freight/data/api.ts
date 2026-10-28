import { getData, postData, putData } from '@/utils/dataClient'

const API_PATH = '/freights'

export interface FreightQueryParams {
  per_page?: number
  page?: number
  date_from?: string
  date_to?: string
  search?: string
  freight_status?: string
  lock_history?: boolean
  zone_id?: number
  /** Column sort — API field (`voucher_date`, `voucher_no`, `party`). */
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

/**
 * Minimized params for the dedicated delivery-lock list endpoint. The export
 * hook mirrors the backend route option (`freight_status` only) so stored
 * search params never leak into the fetch call.
 */
export interface DeliveryLockQueryParams {
  per_page?: number
  page?: number
}

async function fetchFreightService(
  type: string,
  params?: FreightQueryParams,
  signal?: AbortSignal,
) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value))
      }
    })
  }
  const queryString = searchParams.toString()
  const url = queryString
    ? `${API_PATH}/${type}?${queryString}`
    : `${API_PATH}/${type}`
  return await getData(url, signal ? { signal } : undefined)
}

const API_PATH_DELIVERY_LOCK = '/delivery_lock'

/**
 * Dedicated endpoint for the delivery-lock list — only the lock metadata
 * (id, delivery_no, party, created_at, reason, note) is returned, not the full freight
 * payload. `GET /api/delivery_lock`.
 */
async function fetchDeliveryLockService(
  params?: DeliveryLockQueryParams,
  signal?: AbortSignal,
) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value))
      }
    })
  }
  const queryString = searchParams.toString()
  const url = queryString
    ? `${API_PATH_DELIVERY_LOCK}?${queryString}`
    : API_PATH_DELIVERY_LOCK
  const response = await getData(url, signal ? { signal } : undefined)
  if (response?.data) {
    response.data = response.data.map((lock: any) => ({
      ...lock,
      reason: lock.reason ?? 'other',
      note: lock.note ?? null,
    }))
  }
  return response
}
async function fetchFreightByIdService(type: string, id: number) {
  return await getData(`${API_PATH}/${type}/${id}`)
}

async function fetchFreightReportService(type: string) {
  // console.log(`${API_PATH}_${type}`)
  return await getData(`${API_PATH}_${type}`)
}

async function storeFreightService(data: any) {
  // Placeholder for actual implementation
  // console.log("storeFreightService", data)
  Promise.resolve()

  return await postData(`${API_PATH}`, data)
}

async function updateFreightService(data: any) {
  // Placeholder for actual implementation
  console.log('updateFreightService', data)
  Promise.resolve()
  return await putData(`${API_PATH}/${data.id}`, data)
}

async function storeVoucherDispatchDetailService(data: any) {
  // Placeholder for actual implementation
  console.log('storeVoucherDispatchDetailService', data)
  Promise.resolve()
  return await postData(`/voucher_dispatch_details`, data)
}
async function updateVoucherDispatchDetailService(data: any) {
  // Placeholder for actual implementation
  // console.log(data)
  Promise.resolve()
  return await putData(`/voucher_dispatch_details/${data.id}`, data)
}

/** Payload for locking (postponing) a delivery note from the freight grid. */
export interface DeliveryLockPayload {
  reason: string
  note?: string | null
  /** ISO datetime for the postponement; omitted = now. */
  locked_at?: string | null
  /** ISO datetime for the release; omitted = now. */
  unlocked_at?: string | null
}

/**
 * Lock (postpone) a delivery note — allowed before and after the freight bill
 * is prepared. `POST /api/delivery-locks` with `{ id, lock, payload }`.
 */
async function lockDeliveryService(id: number, data: DeliveryLockPayload) {
  return await postData('/delivery-locks', {
    id,
    lock: true,
    payload: {
      reason: data.reason,
      note: data.note ?? null,
      locked_at: data.locked_at ?? null,
    },
  })
}

/** Unlock a previously postponed delivery — same endpoint with `lock: false`. */
async function unlockDeliveryService(id: number, unlockedAt?: string | null) {
  return await postData('/delivery-locks', {
    id,
    lock: false,
    payload: unlockedAt ? { unlocked_at: unlockedAt } : undefined,
  })
}

export {
  fetchFreightService,
  fetchFreightByIdService,
  fetchFreightReportService,
  storeFreightService,
  updateFreightService,
  storeVoucherDispatchDetailService,
  updateVoucherDispatchDetailService,
  lockDeliveryService,
  unlockDeliveryService,
  fetchDeliveryLockService,
}
