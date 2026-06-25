import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/shifts"
export async function fetchShiftService() {
    return await getData(API_PATH)
}
export async function storeShiftService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateShiftService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}