import { SkeletonTable } from '@/components/skeleton'
import { stockSummaryQueryOptions } from '@/features/modules/voucher/stock_summary/data/queryOptions'
import StockInHand from '@/features/modules/voucher/stock_summary/stock_in_hand/stock_in_hand'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute(
  '/_protected/reports/stock_summary/_layout/stock-in-hand',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(stockSummaryQueryOptions('stock_in_hand')),
  component: () => {
    const { data: stocksummary } = useSuspenseQuery(stockSummaryQueryOptions('stock_in_hand'))

    return (
      <Suspense fallback={<SkeletonTable />}>
        <StockInHand data={stocksummary?.data} />
      </Suspense>
    ) 
  },
  errorComponent: () => <div>Error loading stock summary data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

