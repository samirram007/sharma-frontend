import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/company_types"
export async function fetchCompanyTypeService() {
    return await getData(API_PATH)
}
export async function fetchCompanyTypeByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}
export async function storeCompanyTypeService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateCompanyTypeService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}