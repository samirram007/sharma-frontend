import { SkeletonTable } from '@/components/skeleton'
import { stockSummaryQueryOptions } from '@/features/modules/voucher/stock_summary/data/queryOptions'
import StockInHandGodownWise from '@/features/modules/voucher/stock_summary/stock_in_hand_godown_wise/stock_in_hand_godown_wise'


import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute(
  '/_protected/reports/stock_summary/_layout/stock-in-hand-godown-wise',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(stockSummaryQueryOptions('stock_in_hand_godown_wise')),
  component: () => {
    const { data: stocksummary } = useSuspenseQuery(stockSummaryQueryOptions('stock_in_hand_godown_wise'))

    return (
      <Suspense fallback={<SkeletonTable />}>
        <StockInHandGodownWise data={stocksummary?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading stock_in_hand_godown_wise data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
}

)