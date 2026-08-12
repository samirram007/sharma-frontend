import { getData, postData, putData } from '@/utils/dataClient'
import { PHYSICAL_STOCK_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withPhysicalStockVoucherType = (payload: Record<string, unknown>) => ({
  ...payload,
  voucherTypeId: PHYSICAL_STOCK_VOUCHER_TYPE_ID,
})

export async function fetchPhysicalStockService() {
  return await getData(API_PATH)
}

export async function fetchPhysicalStockByIdService(id: number) {
  return await getData(`${API_PATH}/${id}`)
}

export async function storePhysicalStockService(
  payload: Record<string, unknown>,
) {
  return await postData(API_PATH, withPhysicalStockVoucherType(payload))
}

export async function updatePhysicalStockService(
  payload: Record<string, unknown>,
) {
  return await putData(
    `${API_PATH}/${payload.id}`,
    withPhysicalStockVoucherType(payload),
  )
}
