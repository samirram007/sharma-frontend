import CurrencyProvider from '@/features/modules/currency/contexts/currency-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/currency/_layout',
)({

  component: () => {
    //const { data: currency } = useSuspenseQuery(currencyQueryOptions())
    return (
      <CurrencyProvider>
        <Outlet />
      </CurrencyProvider >
    )
  },
  errorComponent: () => <div> <span className='bg-red-400  '>Layout:</span> Error loading currency data[]. </div>
  ,
  pendingComponent: () => <Loader className="animate-spin" />,
})


