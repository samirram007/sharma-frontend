import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/delivery_places"
export async function fetchDeliveryPlaceService() {
    return await getData(API_PATH)
}
export async function storeDeliveryPlaceService(payload: any) {
    const response = await postData(API_PATH, payload)
    return response.data
}
export async function updateDeliveryPlaceService(payload: any) {
    const response = await putData(`${API_PATH}/${payload.id}`, payload)
    return response.data
}
export async function deleteDeliveryPlaceService(payload: any) {
    const response = await putData(`${API_PATH}/${payload.id}`, payload)
    return response.data
}