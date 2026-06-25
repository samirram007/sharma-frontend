import { deleteData, getData, postData, putData } from "@/utils/dataClient"
import { CONTRA_VOUCHER_TYPE_ID } from './schema'

const API_PATH = "/receipt_vouchers"

const withContraVoucherType = (payload: Record<string, unknown>) => ({
    ...payload,
    voucherTypeId: CONTRA_VOUCHER_TYPE_ID,
})

export async function fetchContraService() {
    return await getData(API_PATH)
}
export async function fetchContraByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeContraService(payload: any) {
    return await postData(API_PATH, withContraVoucherType(payload))
}
export async function updateContraService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, withContraVoucherType(payload))
}

export async function deleteContraService(id: number) {
    return await deleteData(`${API_PATH}/${id}`)
}