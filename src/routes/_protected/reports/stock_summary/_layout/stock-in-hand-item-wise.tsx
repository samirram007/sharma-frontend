import { SkeletonTable } from '@/components/skeleton'
import { stockSummaryQueryOptions } from '@/features/modules/voucher/stock_summary/data/queryOptions'
import StockInHandItemWise from '@/features/modules/voucher/stock_summary/stock_in_hand_item_wise/stock_in_hand_item_wise'


import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute(
  '/_protected/reports/stock_summary/_layout/stock-in-hand-item-wise',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(stockSummaryQueryOptions('stock_in_hand_item_wise')),
  component: () => {
    const { data: stocksummary } = useSuspenseQuery(stockSummaryQueryOptions('stock_in_hand_item_wise'))
    return (
      <Suspense fallback={<SkeletonTable />}>
        <StockInHandItemWise data={stocksummary?.data} />
      </Suspense>
    ) 

  },
  errorComponent: () => <div>Error loading stock_in_hand_item_in_details data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

