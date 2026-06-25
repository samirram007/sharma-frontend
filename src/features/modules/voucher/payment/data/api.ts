import { deleteData, getData, postData, putData } from '@/utils/dataClient'
import { PAYMENT_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withPaymentVoucherType = (payload: Record<string, unknown>) => ({
    ...payload,
    voucherTypeId: PAYMENT_VOUCHER_TYPE_ID,
})

export async function fetchPaymentService() {
    return await getData(API_PATH)
}

export async function fetchPaymentByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storePaymentService(payload: Record<string, unknown>) {
    return await postData(API_PATH, withPaymentVoucherType(payload))
}

export async function updatePaymentService(payload: Record<string, unknown>) {
    return await putData(`${API_PATH}/${payload.id}`, withPaymentVoucherType(payload))
}

export async function deletePaymentService(id: number) {
    return await deleteData(`${API_PATH}/${id}`)
}
