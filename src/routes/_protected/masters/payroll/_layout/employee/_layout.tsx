import GeneralError from '@/features/errors/general-error'
import EmployeeProvider from '@/features/modules/employee/contexts/employee-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/payroll/_layout/employee/_layout',
)({
  component: () => {
    // const { data: supplier } = useSuspenseQuery(supplierQueryOptions())
    return (
      <EmployeeProvider>
        <Outlet />
      </EmployeeProvider>
    )
  },
  errorComponent: () => <GeneralError minimal />,
  pendingComponent: () => <Loader className="animate-spin" />,
})
