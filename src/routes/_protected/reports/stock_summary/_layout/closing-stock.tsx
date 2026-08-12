import { SkeletonTable } from '@/components/skeleton'
import { stockSummaryQueryOptions } from '@/features/modules/voucher/stock_summary/data/queryOptions'
import ClosingStock from '@/features/modules/voucher/stock_summary/closing_stock/closing_stock'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'
import { z } from 'zod'

const closingStockSearchSchema = z.object({
  view: z.enum(['godown', 'batch']).default('godown').catch('godown'),
})

export const Route = createFileRoute(
  '/_protected/reports/stock_summary/_layout/closing-stock',
)({
  validateSearch: (search) => closingStockSearchSchema.parse(search),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      stockSummaryQueryOptions('closing_stock'),
    ),
  component: () => {
    const { data: stocksummary } = useSuspenseQuery(
      stockSummaryQueryOptions('closing_stock'),
    )
    const search = Route.useSearch()
    const navigate = useNavigate()

    return (
      <Suspense fallback={<SkeletonTable />}>
        <ClosingStock
          data={stocksummary?.data}
          view={search.view}
          onViewChange={(view) =>
            navigate({
              to: '.',
              search: (prev) => ({ ...prev, view }),
            })
          }
        />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading closing stock data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})
