import { getData } from '@/utils/dataClient'

export async function fetchRunningBalanceItemsService() {
  return await getData('stock_summaries/running_balance')
}

export async function fetchRunningBalanceDetailService(itemId: number, godownId?: number) {
  const params = godownId ? `?godown_id=${godownId}` : ''
  return await getData(`stock_summaries/running_balance/${itemId}${params}`)
}

export async function fetchRunningBalanceGodownsService() {
  return await getData('stock_summaries/running_balance_godowns')
}

export async function fetchGodownRunningBalanceItemsService(godownId: number) {
  return await getData(`stock_summaries/running_balance_godowns/${godownId}`)
}
