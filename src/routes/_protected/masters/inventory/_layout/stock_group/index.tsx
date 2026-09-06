import StockGroup from '@/features/modules/stock_group'
import type { StockGroupListStatus } from '@/features/modules/stock_group'
import { stockGroupQueryOptions } from '@/features/modules/stock_group/data/queryOptions'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute(
  '/_protected/masters/inventory/_layout/stock_group/',
)({
  // Seed the cache with the default slice (active only) so the page renders
  // instantly on first load; switching status later fetches its own slice.
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(stockGroupQueryOptions('active')),
  component: () => {
    const [status, setStatus] = useState<StockGroupListStatus>('active')
    const {
      data: stockGroup,
      isFetching,
      isPending,
    } = useQuery(stockGroupQueryOptions(status))
    return (
      <StockGroup
        data={stockGroup?.data}
        status={status}
        onStatusChange={setStatus}
        refreshing={isFetching || isPending}
      />
    )
  },
  errorComponent: () => <div>Error loading stock group data.</div>,
})
