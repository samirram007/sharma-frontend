import GeneralError from '@/features/errors/general-error'
import DistributorProvider from '@/features/modules/distributor/contexts/distributor-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/party/_layout/distributor/_layout',
)({

  component: () => {
    // const { data: supplier } = useSuspenseQuery(supplierQueryOptions())
    return (
      <DistributorProvider>
        <Outlet />
      </DistributorProvider>
    )
  },
  errorComponent: () => <GeneralError minimal />,
  pendingComponent: () => <Loader className="animate-spin" />,
})


