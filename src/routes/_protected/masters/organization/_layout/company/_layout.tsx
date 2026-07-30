import GeneralError from '@/features/errors/general-error'
import CompanyProvider from '@/features/modules/company/contexts/company-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/company/_layout',
)({

  component: () => {
    //const { data: company } = useSuspenseQuery(companyQueryOptions())
    return (
      <CompanyProvider>
        <Outlet />
      </CompanyProvider >
    )
  },
  errorComponent: () => <GeneralError minimal />,
  pendingComponent: () => <Loader className="animate-spin" />,
})


