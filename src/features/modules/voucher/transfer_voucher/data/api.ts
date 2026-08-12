import { getData, postData, putData } from '@/utils/dataClient'
import { TRANSFER_VOUCHER_VOUCHER_TYPE_ID } from './schema'

// Transfer Voucher is a stock converter voucher — it flows through the
// generic Voucher pipeline (same as Receipt Note / Delivery Note).
const API_PATH = '/vouchers'

const withTransferVoucherVoucherType = (payload: Record<string, unknown>) => ({
  ...payload,
  voucherTypeId: TRANSFER_VOUCHER_VOUCHER_TYPE_ID,
})

export async function fetchTransferVoucherService() {
  return await getData(API_PATH)
}

export async function fetchTransferVoucherByIdService(id: number) {
  return await getData(`${API_PATH}/${id}`)
}

export async function storeTransferVoucherService(
  payload: Record<string, unknown>,
) {
  return await postData(API_PATH, withTransferVoucherVoucherType(payload))
}

export async function updateTransferVoucherService(
  payload: Record<string, unknown>,
) {
  return await putData(
    `${API_PATH}/${payload.id}`,
    withTransferVoucherVoucherType(payload),
  )
}
