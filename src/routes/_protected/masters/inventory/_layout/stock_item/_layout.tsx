
import StockItemProvider from '@/features/modules/stock_item/contexts/stock_item-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/inventory/_layout/stock_item/_layout',
)({

  component: () => {
    //const { data: stockitem } = useSuspenseQuery(stockitemQueryOptions())
    return (
      <StockItemProvider>
        <Outlet />
      </StockItemProvider >
    )
  },
  errorComponent: () => <div> <span className='bg-red-400  '>Layout:</span> Error loading stock item data[]. </div>
  ,
  pendingComponent: () => <Loader className="animate-spin" />,
})


