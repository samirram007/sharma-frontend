import GeneralError from '@/features/errors/general-error'
import StorageUnitProvider from '@/features/modules/storage_unit/contexts/storage_unit-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/inventory/_layout/storage_unit/_layout',
)({

  component: () => {
    // const { data: company } = useSuspenseQuery(companyQueryOptions())
    return (
      <StorageUnitProvider>
        <Outlet />
      </StorageUnitProvider >
    )
  },
  errorComponent: () => <GeneralError minimal />,
  pendingComponent: () => <Loader className="animate-spin" />,
})


