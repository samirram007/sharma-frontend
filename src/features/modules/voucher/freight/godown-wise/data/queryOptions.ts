import { queryOptions } from '@tanstack/react-query'
import { fetchFreightGodownWiseService } from './api'

const queryKey = 'FreightGodownWise'

export const freightGodownWiseQueryOptions = () =>
  queryOptions({
    queryKey: [queryKey],
    queryFn: () => fetchFreightGodownWiseService(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
