import { getData, postData, putData } from '@/utils/dataClient'

const API_PATH = '/faqs'

export async function fetchFaqService() {
  return await getData(API_PATH)
}

export async function fetchFaqByIdService(id: number) {
  return await getData(`${API_PATH}/${id}`)
}

export async function storeFaqService(payload: any) {
  return await postData(API_PATH, payload)
}

export async function updateFaqService(payload: any) {
  return await putData(`${API_PATH}/${payload.id}`, payload)
}
