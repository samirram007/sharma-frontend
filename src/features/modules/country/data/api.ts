import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/countries"
export async function fetchCountryService() {
    //console.log("first", API_PATH)
    return await getData(API_PATH)
}
export async function fetchCountryByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}
export async function storeCountryService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateCountryService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}