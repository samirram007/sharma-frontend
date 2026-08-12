import { getData, postData, putData } from '@/utils/dataClient'
import { SALES_ORDER_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withSalesOrderVoucherType = (payload: Record<string, unknown>) => ({
  ...payload,
  voucherTypeId: SALES_ORDER_VOUCHER_TYPE_ID,
})

export async function fetchSalesOrderService() {
  return await getData(API_PATH)
}

export async function fetchSalesOrderByIdService(id: number) {
  return await getData(`${API_PATH}/${id}`)
}

export async function storeSalesOrderService(payload: Record<string, unknown>) {
  return await postData(API_PATH, withSalesOrderVoucherType(payload))
}

export async function updateSalesOrderService(
  payload: Record<string, unknown>,
) {
  return await putData(
    `${API_PATH}/${payload.id}`,
    withSalesOrderVoucherType(payload),
  )
}
