import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/designations"
export async function fetchDesignationService() {
    return await getData(API_PATH)
}
export async function storeDesignationService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateDesignationService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}