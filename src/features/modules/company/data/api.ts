import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/companies"
export async function fetchCompanyService() {
    return await getData(API_PATH)
}
export async function fetchCompanyByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeCompanyService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateCompanyService(payload: any) {

    return await putData(`${API_PATH}/${payload.id}`, payload)
}