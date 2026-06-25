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
  errorComponent: () => <div> <span className='bg-red-400  '>Layout:</span> Error loading company data[]. </div>
  ,
  pendingComponent: () => <Loader className="animate-spin" />,
})


