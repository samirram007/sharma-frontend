import { getData, postData, putData } from '@/utils/dataClient'
import { REJECTION_OUT_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withRejectionOutVoucherType = (payload: Record<string, unknown>) => ({
    ...payload,
    voucherTypeId: REJECTION_OUT_VOUCHER_TYPE_ID,
})

export async function fetchRejectionOutService() {
    return await getData(API_PATH)
}

export async function fetchRejectionOutByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeRejectionOutService(payload: Record<string, unknown>) {
    return await postData(API_PATH, withRejectionOutVoucherType(payload))
}

export async function updateRejectionOutService(payload: Record<string, unknown>) {
    return await putData(`${API_PATH}/${payload.id}`, withRejectionOutVoucherType(payload))
}
