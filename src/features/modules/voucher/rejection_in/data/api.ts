import { getData, postData, putData } from '@/utils/dataClient'
import { REJECTION_IN_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withRejectionInVoucherType = (payload: Record<string, unknown>) => ({
    ...payload,
    voucherTypeId: REJECTION_IN_VOUCHER_TYPE_ID,
})

export async function fetchRejectionInService() {
    return await getData(API_PATH)
}

export async function fetchRejectionInByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeRejectionInService(payload: Record<string, unknown>) {
    return await postData(API_PATH, withRejectionInVoucherType(payload))
}

export async function updateRejectionInService(payload: Record<string, unknown>) {
    return await putData(`${API_PATH}/${payload.id}`, withRejectionInVoucherType(payload))
}
