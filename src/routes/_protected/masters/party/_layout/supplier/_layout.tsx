import GeneralError from '@/features/errors/general-error'
import SupplierProvider from '@/features/modules/supplier/contexts/supplier-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/party/_layout/supplier/_layout',
)({
  component: () => {
    // const { data: supplier } = useSuspenseQuery(supplierQueryOptions())
    return (
      <SupplierProvider>
        <Outlet />
      </SupplierProvider>
    )
  },
  errorComponent: () => <GeneralError minimal />,
  pendingComponent: () => <Loader className="animate-spin" />,
})
