import { stockSummaryQueryOptions } from '@/features/modules/voucher/stock_summary/data/queryOptions'

import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

import FreightGodownWise from '@/features/modules/voucher/freight/godown-wise';

export const Route = createFileRoute(
    '/_protected/reports/freight/_layout/freight-godown-wise',
)({
    loader: ({ context }) =>
        context.queryClient.ensureQueryData(stockSummaryQueryOptions('stock_in_hand')),
    component: () => {
        const { data: stocksummary } = useSuspenseQuery(stockSummaryQueryOptions('stock_in_hand'))

        return <FreightGodownWise data={stocksummary?.data} />
    },
    errorComponent: () => <div>Error loading stock summary data.</div>,
    pendingComponent: () => <Loader className="animate-spin" />,
})

