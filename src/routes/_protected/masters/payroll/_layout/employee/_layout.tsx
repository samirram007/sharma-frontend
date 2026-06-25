import EmployeeProvider from '@/features/modules/employee/contexts/employee-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/payroll/_layout/employee/_layout',
)({

  component: () => {
    //const { data: supplier } = useSuspenseQuery(supplierQueryOptions())
    return (
      <EmployeeProvider>
        <Outlet />
      </EmployeeProvider>
    )
  },
  errorComponent: () => <div> <span className='bg-red-400  '>Layout:</span> Error loading supplier data[]. </div>
  ,
  pendingComponent: () => <Loader className="animate-spin" />,
})


