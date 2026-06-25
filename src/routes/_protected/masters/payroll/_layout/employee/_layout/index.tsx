
import { employeeQueryOptions } from '@/features/modules/employee/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const Employee = React.lazy(() =>
  import('@/features/modules/employee')
)

export const Route = createFileRoute('/_protected/masters/payroll/_layout/employee/_layout/',)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(employeeQueryOptions()),
  component: () => {
    const { data: employee } = useSuspenseQuery(employeeQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <Employee data={employee?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading employee data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})