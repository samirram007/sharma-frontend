import { getData, postData } from '@/utils/dataClient'

export async function fetchOpeningBalanceSetupService() {
  return await getData('opening-balance/setup-data')
}

export async function storeOpeningBalanceService(payload: {
  remarks?: string
  ledger_entries: Array<{
    ledger_id: number
    amount: number
  }>
  stock_entries: Array<{
    item_id: number
    godowns: Array<{
      godown_id: number
      quantity: number
    }>
  }>
}) {
  return await postData('opening-balance', payload)
}

export async function fetchOpeningBalanceStatusService() {
  return await getData('opening-balance/status')
}
