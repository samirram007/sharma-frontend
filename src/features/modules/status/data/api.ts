import { getData, postData, putData } from "@/utils/dataClient"

const API_PATH = "/statuses"

export async function fetchStatusService() {
    return await getData(API_PATH)
}

export async function storeStatusService(payload: any) {
    return await postData(API_PATH, payload)
}

export async function updateStatusService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
