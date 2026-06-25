import StockUnit from '@/features/modules/stock_unit';
import { stockUnitQueryOptions } from '@/features/modules/stock_unit/data/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/masters/inventory/_layout/stock_unit/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(stockUnitQueryOptions()),
  component: () => {
    const { data: stockUnit } = useSuspenseQuery(stockUnitQueryOptions())
    console.log(stockUnit, 'stock unit data');
    return <StockUnit data={stockUnit?.data} />
  },
  errorComponent: () => <div>Error loading stock unit data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

