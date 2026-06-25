import { SkeletonTable } from '@/components/skeleton'
import { stockSummaryQueryOptions } from '@/features/modules/voucher/stock_summary/data/queryOptions'
import StockInHandZoneWiseComponent from '@/features/modules/voucher/stock_summary/stock_in_hand_zone_wise'



import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute(
  '/_protected/reports/stock_summary/_layout/stock-in-hand-zone-wise',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(stockSummaryQueryOptions('stock_in_hand_zone_wise')),
  component: () => {
    const { data: stocksummary } = useSuspenseQuery(stockSummaryQueryOptions('stock_in_hand_zone_wise'))

    return (
      <Suspense fallback={<SkeletonTable />}>
        <StockInHandZoneWiseComponent data={stocksummary?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading stock_in_hand_zone_wise data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
}

)