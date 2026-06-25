import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/gst_registration_types"
export async function fetchGstRegistrationTypeService() {
    return await getData(API_PATH)
}
export async function fetchGstRegistrationTypeByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}
export async function storeGstRegistrationTypeService(payload: any) {

    return await postData(API_PATH, payload)
}
export async function updateGstRegistrationTypeService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}