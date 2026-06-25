import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/account_natures"
export async function fetchAccountNatureService() {
    return await getData(API_PATH)
}
export async function storeAccountNatureService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateAccountNatureService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}