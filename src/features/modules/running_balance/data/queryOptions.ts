import { queryOptions } from '@tanstack/react-query'
import {
  fetchRunningBalanceItemsService,
  fetchRunningBalanceDetailService,
  fetchRunningBalanceGodownsService,
  fetchGodownRunningBalanceItemsService,
} from './api'

const BASE_KEY = 'runningBalance'

export const runningBalanceItemsQueryOptions = () =>
  queryOptions({
    queryKey: [BASE_KEY, 'items'],
    queryFn: fetchRunningBalanceItemsService,
    staleTime: 1000 * 30,
    retry: 1,
  })

export const runningBalanceDetailQueryOptions = (itemId: number, godownId?: number) =>
  queryOptions({
    queryKey: [BASE_KEY, 'detail', itemId, godownId],
    queryFn: () => fetchRunningBalanceDetailService(itemId, godownId),
    staleTime: 1000 * 30,
    retry: 1,
    enabled: !!itemId,
  })

export const runningBalanceGodownsQueryOptions = () =>
  queryOptions({
    queryKey: [BASE_KEY, 'godowns'],
    queryFn: fetchRunningBalanceGodownsService,
    staleTime: 1000 * 30,
    retry: 1,
  })

export const godownRunningBalanceItemsQueryOptions = (godownId: number) =>
  queryOptions({
    queryKey: [BASE_KEY, 'godown-items', godownId],
    queryFn: () => fetchGodownRunningBalanceItemsService(godownId),
    staleTime: 1000 * 30,
    retry: 1,
    enabled: !!godownId,
  })
