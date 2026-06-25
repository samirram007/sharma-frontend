import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/suppliers"
export async function fetchSupplierService() {
    return await getData(API_PATH)
}
export async function fetchSupplierByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeSupplierService(payload: any) {
    console.log("Supplier payload: ", payload)
    return await postData(API_PATH, payload)
}
export async function updateSupplierService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}