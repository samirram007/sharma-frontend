import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/voucher_types"
export async function fetchVoucherTypeService() {
    return await getData(API_PATH)
}
export async function fetchVoucherTypeByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeVoucherTypeService(payload: any) {
    return await postData(API_PATH, payload)
}
export async function updateVoucherTypeService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}