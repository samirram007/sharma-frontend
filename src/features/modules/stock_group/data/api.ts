import { getData, postData, putData } from '@/utils/dataClient'

const API_PATH = '/stock_groups'

/**
 * Fetch stock groups. Pass { status: 'active' | 'inactive' } to restrict the
 * result server-side; omit it (or pass status: 'all') to get every record.
 */
async function fetchStockGroupService(params?: { status?: string }) {
  const status = params?.status
  const query = status && status !== 'all' ? { params: { status } } : undefined
  return await getData(API_PATH, query)
}
async function storeStockGroupService(payload: any) {
  return await postData(API_PATH, payload)
}
async function updateStockGroupService(payload: any) {
  return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteStockGroupService(payload: any) {
  return await putData(`${API_PATH}/${payload.id}`, payload)
}

export {
  deleteStockGroupService,
  fetchStockGroupService,
  storeStockGroupService,
  updateStockGroupService,
}
