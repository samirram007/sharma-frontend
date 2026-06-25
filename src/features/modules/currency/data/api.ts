import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/currencies"
export async function fetchCurrencyService() {
    return await getData(API_PATH)
}
export async function fetchCurrencyByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}
export async function storeCurrencyService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateCurrencyService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}