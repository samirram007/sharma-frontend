import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/storage_units"
export async function fetchStorageUnitService() {
    return await getData(API_PATH)
}
export async function fetchStorageUnitByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeStorageUnitService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateStorageUnitService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}