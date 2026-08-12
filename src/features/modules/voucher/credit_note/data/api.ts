import { getData, postData, putData } from '@/utils/dataClient'
import { CREDIT_NOTE_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withCreditNoteVoucherType = (payload: Record<string, unknown>) => ({
  ...payload,
  voucherTypeId: CREDIT_NOTE_VOUCHER_TYPE_ID,
})

export async function fetchCreditNoteService() {
  return await getData(API_PATH)
}

export async function fetchCreditNoteByIdService(id: number) {
  return await getData(`${API_PATH}/${id}`)
}

export async function storeCreditNoteService(payload: Record<string, unknown>) {
  return await postData(API_PATH, withCreditNoteVoucherType(payload))
}

export async function updateCreditNoteService(
  payload: Record<string, unknown>,
) {
  return await putData(
    `${API_PATH}/${payload.id}`,
    withCreditNoteVoucherType(payload),
  )
}
