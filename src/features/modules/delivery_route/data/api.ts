import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/delivery_routes"
export async function fetchDeliveryRouteService() {
    return await getData(API_PATH)
}
export async function storeDeliveryRouteService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateDeliveryRouteService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}