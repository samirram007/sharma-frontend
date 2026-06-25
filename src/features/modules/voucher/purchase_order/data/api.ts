import { getData, postData, putData } from '@/utils/dataClient'
import { PURCHASE_ORDER_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withPurchaseOrderVoucherType = (payload: Record<string, unknown>) => ({
    ...payload,
    voucherTypeId: PURCHASE_ORDER_VOUCHER_TYPE_ID,
})

export async function fetchPurchaseOrderService() {
    return await getData(API_PATH)
}

export async function fetchPurchaseOrderByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storePurchaseOrderService(payload: Record<string, unknown>) {
    return await postData(API_PATH, withPurchaseOrderVoucherType(payload))
}

export async function updatePurchaseOrderService(payload: Record<string, unknown>) {
    return await putData(`${API_PATH}/${payload.id}`, withPurchaseOrderVoucherType(payload))
}
