import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/permissions"
export async function fetchPermissionService() {
    return await getData(API_PATH)
}
export async function storePermissionService(payload: any) {
    console.log(payload)
    return await postData(API_PATH, payload)
}
export async function updatePermissionService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}