import { stockSummaryQueryOptions } from '@/features/modules/voucher/stock_summary/data/queryOptions'
import StockInHand from '@/features/modules/voucher/stock_summary/stock_in_hand/stock_in_hand'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/reports/stock_summary/_layout/net-stock',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(stockSummaryQueryOptions('net_stock')),
  component: () => {
    const { data: stocksummary } = useSuspenseQuery(stockSummaryQueryOptions('net_stock'))

    return <StockInHand data={stocksummary?.data} />
  },
  errorComponent: () => <div>Error loading stock summary data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})
