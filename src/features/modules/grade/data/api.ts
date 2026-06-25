import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/grades"
export async function fetchGradeService() {
    return await getData(API_PATH)
}
export async function storeGradeService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateGradeService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}