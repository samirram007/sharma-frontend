import { getData, postData, putData } from '@/utils/dataClient'
import { JOURNAL_VOUCHER_TYPE_ID } from './schema'

const API_PATH = '/receipt_vouchers'

const withJournalVoucherType = (payload: Record<string, unknown>) => ({
    ...payload,
    voucherTypeId: JOURNAL_VOUCHER_TYPE_ID,
})

export async function fetchJournalService() {
    return await getData(API_PATH)
}

export async function fetchJournalByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeJournalService(payload: Record<string, unknown>) {
    return await postData(API_PATH, withJournalVoucherType(payload))
}

export async function updateJournalService(payload: Record<string, unknown>) {
    return await putData(`${API_PATH}/${payload.id}`, withJournalVoucherType(payload))
}
