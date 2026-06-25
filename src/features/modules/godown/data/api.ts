import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/godowns"
export async function fetchGodownService() {
    return await getData(API_PATH)
}
export async function storeGodownService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateGodownService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}