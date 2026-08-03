import { getData, postData, putData } from '@/utils/dataClient'
import { MANUFACTURING_JOURNAL_VOUCHER_TYPE_ID } from './schema'

// Manufacturing Journal is a stock converter voucher — it flows through the
// generic Voucher pipeline (same as Receipt Note / Delivery Note).
const API_PATH = '/vouchers'

const withManufacturingJournalVoucherType = (payload: Record<string, unknown>) => ({
    ...payload,
    voucherTypeId: MANUFACTURING_JOURNAL_VOUCHER_TYPE_ID,
})

export async function fetchManufacturingJournalService() {
    return await getData(API_PATH)
}

export async function fetchManufacturingJournalByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeManufacturingJournalService(payload: Record<string, unknown>) {
    return await postData(API_PATH, withManufacturingJournalVoucherType(payload))
}

export async function updateManufacturingJournalService(payload: Record<string, unknown>) {
    return await putData(`${API_PATH}/${payload.id}`, withManufacturingJournalVoucherType(payload))
}
