import GeneralError from '@/features/errors/general-error'
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
  errorComponent: () => <GeneralError minimal />,
  pendingComponent: () => <Loader className="animate-spin" />,
})


