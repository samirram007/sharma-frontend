import { getData, postData, putData } from '@/utils/dataClient'
import { SALES_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withSalesVoucherType = (payload: Record<string, unknown>) => ({
    ...payload,
    voucherTypeId: SALES_VOUCHER_TYPE_ID,
})

export async function fetchSalesService() {
    return await getData(API_PATH)
}

export async function fetchSalesByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeSalesService(payload: Record<string, unknown>) {
    return await postData(API_PATH, withSalesVoucherType(payload))
}

export async function updateSalesService(payload: Record<string, unknown>) {
    return await putData(`${API_PATH}/${payload.id}`, withSalesVoucherType(payload))
}
