import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/fiscal_years"
export async function fetchFiscalYearService() {
    return await getData(API_PATH)
}
export async function fetchCurrentFiscalYearService() {
    return await getData(`${API_PATH}/current`)
}
export async function fetchActiveFiscalYearService() {
    return await getData(`${API_PATH}/active`)
}
export async function fetchFiscalYearByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeFiscalYearService(payload: any) {

    return await postData(API_PATH, payload)
}
export async function updateFiscalYearService(payload: any) {
    console.log("Update Payload: ", payload)
    return await putData(`${API_PATH}/${payload.id}`, payload)
}