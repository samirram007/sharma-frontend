
import GeneralError from '@/features/errors/general-error'
import TransporterProvider from '@/features/modules/transporter/contexts/transporter-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/party/_layout/transporter/_layout',
)({

  component: () => {
    //const { data: supplier } = useSuspenseQuery(supplierQueryOptions())
    return (
      <TransporterProvider>
        <Outlet />
      </TransporterProvider>
    )
  },
  errorComponent: () => <GeneralError minimal />,
  pendingComponent: () => <Loader className="animate-spin" />,
})


