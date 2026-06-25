import StockCategory from '@/features/modules/stock_category';
import { stockCategoryQueryOptions } from '@/features/modules/stock_category/data/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/masters/inventory/_layout/stock_category/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(stockCategoryQueryOptions()),
  component: () => {
    const { data: stockCategory } = useSuspenseQuery(stockCategoryQueryOptions())
    console.log(stockCategory, 'stock category data');
    return <StockCategory data={stockCategory?.data} />
  },
  errorComponent: () => <div>Error loading stock category data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

