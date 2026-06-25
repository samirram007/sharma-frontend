import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/distributors"
export async function fetchDistributorService() {
    return await getData(API_PATH)
}
export async function fetchDistributorByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeDistributorService(payload: any) {
    console.log("Distributor payload: ", payload)
    return await postData(API_PATH, payload)
}
export async function updateDistributorService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}