import { getData, postData, putData } from '@/utils/dataClient'
import { DEBIT_NOTE_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withDebitNoteVoucherType = (payload: Record<string, unknown>) => ({
    ...payload,
    voucherTypeId: DEBIT_NOTE_VOUCHER_TYPE_ID,
})

export async function fetchDebitNoteService() {
    return await getData(API_PATH)
}

export async function fetchDebitNoteByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeDebitNoteService(payload: Record<string, unknown>) {
    return await postData(API_PATH, withDebitNoteVoucherType(payload))
}

export async function updateDebitNoteService(payload: Record<string, unknown>) {
    return await putData(`${API_PATH}/${payload.id}`, withDebitNoteVoucherType(payload))
}
