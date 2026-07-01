import { getData, postData } from '@/utils/dataClient'

export async function fetchClosePreviewService(fiscalYearId: number) {
  return await getData(`fiscal-years/${fiscalYearId}/close-preview`)
}

export async function closeFiscalYearService(fiscalYearId: number) {
  return await postData(`fiscal-years/${fiscalYearId}/close`, {})
}

export async function reopenFiscalYearService(fiscalYearId: number) {
  return await postData(`fiscal-years/${fiscalYearId}/reopen`, {})
}
