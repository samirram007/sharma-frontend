import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/transporters"
export async function fetchTransporterService() {
    return await getData(API_PATH)
}
export async function fetchTransporterByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeTransporterService(payload: any) {
    console.log("Transporter payload: ", payload)
    return await postData(API_PATH, payload)
}
export async function updateTransporterService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}