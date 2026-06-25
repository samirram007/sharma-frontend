import UserProvider from '@/features/modules/user/contexts/user-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/administration/_layout/user/_layout',
)({

  component: () => {
    //const { data: supplier } = useSuspenseQuery(supplierQueryOptions())
    return (
      <UserProvider>
        <Outlet />
      </UserProvider>
    )
  },
  errorComponent: () => <div> <span className='bg-red-400  '>Layout:</span> Error loading supplier data[]. </div>
  ,
  pendingComponent: () => <Loader className="animate-spin" />,
})


