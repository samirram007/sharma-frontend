import { getData, postData, putData } from '@/utils/dataClient'

const API_PATH = '/freights'

export interface FreightQueryParams {
  per_page?: number
  page?: number
  date_from?: string
  date_to?: string
  search?: string
  freight_status?: string
  zone_id?: number
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
  console.log('Fetching freight with URL:', url) // Debug log to check the final URL
  return await getData(url, signal ? { signal } : undefined)
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

export {
  fetchFreightService,
  fetchFreightByIdService,
  fetchFreightReportService,
  storeFreightService,
  updateFreightService,
  storeVoucherDispatchDetailService,
  updateVoucherDispatchDetailService,
}
