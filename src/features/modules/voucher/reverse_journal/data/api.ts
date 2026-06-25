import { getData, postData, putData } from '@/utils/dataClient'
import { REVERSE_JOURNAL_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withReverseJournalVoucherType = (payload: Record<string, unknown>) => ({
    ...payload,
    voucherTypeId: REVERSE_JOURNAL_VOUCHER_TYPE_ID,
})

export async function fetchReverseJournalService() {
    return await getData(API_PATH)
}

export async function fetchReverseJournalByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeReverseJournalService(payload: Record<string, unknown>) {
    return await postData(API_PATH, withReverseJournalVoucherType(payload))
}

export async function updateReverseJournalService(payload: Record<string, unknown>) {
    return await putData(`${API_PATH}/${payload.id}`, withReverseJournalVoucherType(payload))
}
