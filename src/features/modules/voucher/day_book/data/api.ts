import { getData, postData, putData } from '@/utils/dataClient'

const API_PATH = '/day_books'

export interface DayBookParams {
  page?: number
  per_page?: number
  search?: string
  voucher_type_id?: number[] | string
  billing_preference?: string
  status?: string
  sort_by?: string
  sort_order?: string
}

function appendQueryParams(params?: DayBookParams): string {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.set('page', String(params.page))
  if (params?.per_page) queryParams.set('per_page', String(params.per_page))
  if (params?.search) queryParams.set('search', params.search)
  if (params?.voucher_type_id) {
    const ids = Array.isArray(params.voucher_type_id)
      ? params.voucher_type_id.join(',')
      : params.voucher_type_id
    queryParams.set('voucher_type_id', ids)
  }
  if (params?.billing_preference) {
    queryParams.set('billing_preference', params.billing_preference)
  }
  if (params?.status) {
    queryParams.set('status', params.status)
  }
  if (params?.sort_by) {
    queryParams.set('sort_by', params.sort_by)
  }
  if (params?.sort_order) {
    queryParams.set('sort_order', params.sort_order)
  }
  const qs = queryParams.toString()
  return qs ? `?${qs}` : ''
}

async function fetchDayBookService(params?: DayBookParams) {
  return await getData(`${API_PATH}${appendQueryParams(params)}`)
}

async function fetchDayBookSelfService(params?: DayBookParams) {
  return await getData(`${API_PATH}_self${appendQueryParams(params)}`)
}

async function storeDayBookService(payload: any) {
  return await postData(API_PATH, payload)
}
async function updateDayBookService(payload: any) {
  return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteDayBookService(payload: any) {
  return await putData(`${API_PATH}/${payload.id}`, payload)
}

async function fetchUsedVoucherTypesService() {
  return await getData(`${API_PATH}_used_voucher_types`)
}

export {
  deleteDayBookService,
  fetchDayBookService,
  fetchDayBookSelfService,
  storeDayBookService,
  updateDayBookService,
  fetchUsedVoucherTypesService,
}
