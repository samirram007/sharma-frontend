
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
  errorComponent: () => <div> <span className='bg-red-400  '>Layout:</span> Error loading supplier data[]. </div>
  ,
  pendingComponent: () => <Loader className="animate-spin" />,
})


