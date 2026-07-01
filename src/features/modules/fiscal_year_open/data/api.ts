import { getData, postData } from '@/utils/dataClient'

export async function fetchOpenPreviewService(newFiscalYearId: number, previousFiscalYearId: number) {
  return await getData(`fiscal-years/${newFiscalYearId}/open-preview/${previousFiscalYearId}`)
}

export async function openFiscalYearService(newFiscalYearId: number, previousFiscalYearId: number) {
  return await postData('fiscal-years/open', {
    new_fiscal_year_id: newFiscalYearId,
    previous_fiscal_year_id: previousFiscalYearId,
  })
}
