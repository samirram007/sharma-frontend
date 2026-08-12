import { getData, postData, putData } from '@/utils/dataClient'
import { PURCHASE_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withPurchaseVoucherType = (payload: Record<string, unknown>) => ({
  ...payload,
  voucherTypeId: PURCHASE_VOUCHER_TYPE_ID,
})

export async function fetchPurchaseService() {
  return await getData(API_PATH)
}

export async function fetchPurchaseByIdService(id: number) {
  return await getData(`${API_PATH}/${id}`)
}

export async function storePurchaseService(payload: Record<string, unknown>) {
  return await postData(API_PATH, withPurchaseVoucherType(payload))
}

export async function updatePurchaseService(payload: Record<string, unknown>) {
  return await putData(
    `${API_PATH}/${payload.id}`,
    withPurchaseVoucherType(payload),
  )
}
