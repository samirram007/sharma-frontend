import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/addresses"
export async function fetchAddressService() {
    return await getData(API_PATH)
}
export async function storeAddressService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateAddressService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}