import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/states"
export async function fetchStateService() {
    return await getData(API_PATH)
}
export async function fetchStateByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}
export async function storeStateService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateStateService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}