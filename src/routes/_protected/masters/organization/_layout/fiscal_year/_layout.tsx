import FiscalYearProvider from '@/features/modules/fiscal_year/contexts/fiscal_year-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/fiscal_year/_layout',
)({

  component: () => {
    //const { data: company } = useSuspenseQuery(companyQueryOptions())
    return (
      <FiscalYearProvider>
        <Outlet />
      </FiscalYearProvider >
    )
  },
  errorComponent: () => <div> <span className='bg-red-400  '>Layout:</span> Error loading fiscal year data. </div>
  ,
  pendingComponent: () => <Loader className="animate-spin" />,
})


