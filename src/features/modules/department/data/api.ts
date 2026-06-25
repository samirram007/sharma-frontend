import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/departments"
export async function fetchDepartmentService() {
    return await getData(API_PATH)
}
export async function storeDepartmentService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateDepartmentService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}