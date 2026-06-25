
import { stockItemQueryOptions } from '@/features/modules/stock_item/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const StockItem = React.lazy(() =>
  import('@/features/modules/stock_item')
)

export const Route = createFileRoute('/_protected/masters/inventory/_layout/stock_item/_layout/',)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(stockItemQueryOptions()),
  component: () => {
    const { data: stockItem } = useSuspenseQuery(stockItemQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <StockItem data={stockItem?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading stock item data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})