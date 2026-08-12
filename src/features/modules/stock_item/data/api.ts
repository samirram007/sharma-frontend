import { getData, postData, putData } from '@/utils/dataClient'

const API_PATH = '/stock_items'
export async function fetchStockItemService() {
  return await getData(API_PATH)
}
export async function fetchStockItemByIdService(id: number) {
  return await getData(`${API_PATH}/${id}`)
}

export async function storeStockItemService(payload: any) {
  console.log(payload)
  return await postData(API_PATH, payload)
}
export async function updateStockItemService(payload: any) {
  return await putData(`${API_PATH}/${payload.id}`, payload)
}
