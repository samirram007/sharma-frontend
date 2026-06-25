import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/delivery_vehicles"
export async function fetchDeliveryVehicleService() {
    return await getData(API_PATH)
}
export async function fetchDeliveryVehicleByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}
export async function storeDeliveryVehicleService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateDeliveryVehicleService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}