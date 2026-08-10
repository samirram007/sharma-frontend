import { getData, postData, putData } from '@/utils/dataClient'

// Opening Stock is a stock-in voucher — it flows through the generic Voucher
// pipeline (same as Conversion Journal / Manufacturing Journal / Receipt Note).
const API_PATH = '/vouchers'

// The OPNSK voucher type id is resolved at runtime (the id differs across
// databases — legacy 9010 vs fresh 10004) and stamped by the mutation before
// saving. The backend also forces it on store/update, so these functions do
// NOT inject any hardcoded id.
// The OPNSK type id is resolved at runtime — pass it along so the backend can
// filter the voucher list server-side (the unfiltered /vouchers list loads
// every voucher with all deep relations and exhausts PHP memory on large
// datasets).
export async function fetchOpeningStockService(openingStockTypeId?: number) {
  const query = openingStockTypeId ? `?voucherTypeId=${openingStockTypeId}` : ''
  return await getData(`${API_PATH}${query}`)
}

export async function fetchOpeningStockByIdService(id: number) {
  return await getData(`${API_PATH}/${id}`)
}

export async function fetchOpeningStockVoucherTypeService() {
  return await getData(`${API_PATH}/opening-stock/voucher-type`)
}

export async function fetchPreviousYearClosingStockService() {
  return await getData(`${API_PATH}/opening-stock/previous-year-closing`)
}

export async function storeOpeningStockService(payload: Record<string, unknown>) {
  return await postData(API_PATH, payload)
}

export async function updateOpeningStockService(payload: Record<string, unknown>) {
  return await putData(`${API_PATH}/${payload.id}`, payload)
}
