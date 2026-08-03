import { getData, postData, putData } from '@/utils/dataClient'
import { CONVERSION_JOURNAL_VOUCHER_TYPE_ID } from './schema'

// Conversion Journal is a stock converter voucher — it flows through the
// generic Voucher pipeline (same as Manufacturing Journal / Receipt Note).
const API_PATH = '/vouchers'

const withConversionJournalVoucherType = (payload: Record<string, unknown>) => ({
  ...payload,
  voucherTypeId: CONVERSION_JOURNAL_VOUCHER_TYPE_ID,
})

export async function fetchConversionJournalService() {
  return await getData(API_PATH)
}

export async function fetchConversionJournalByIdService(id: number) {
  return await getData(`${API_PATH}/${id}`)
}

export async function storeConversionJournalService(payload: Record<string, unknown>) {
  return await postData(API_PATH, withConversionJournalVoucherType(payload))
}

export async function updateConversionJournalService(payload: Record<string, unknown>) {
  return await putData(`${API_PATH}/${payload.id}`, withConversionJournalVoucherType(payload))
}
