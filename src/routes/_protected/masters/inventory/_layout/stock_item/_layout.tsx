import GeneralError from '@/features/errors/general-error'
import StockItemProvider from '@/features/modules/stock_item/contexts/stock_item-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/inventory/_layout/stock_item/_layout',
)({
  component: () => {
    // const { data: stockitem } = useSuspenseQuery(stockitemQueryOptions())
    return (
      <StockItemProvider>
        <Outlet />
      </StockItemProvider>
    )
  },
  errorComponent: () => <GeneralError minimal />,
  pendingComponent: () => <Loader className="animate-spin" />,
})
