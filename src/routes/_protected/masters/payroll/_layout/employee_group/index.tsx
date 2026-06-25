import EmployeeGroup from '@/features/modules/employee_group';
import { employeeGroupQueryOptions } from '@/features/modules/employee_group/data/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/masters/payroll/_layout/employee_group/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(employeeGroupQueryOptions()),
  component: () => {
    const { data: employeeGroup } = useSuspenseQuery(employeeGroupQueryOptions())
    // console.log(employeeGroup, 'employee group data');
    return <EmployeeGroup data={employeeGroup?.data} />
  },
  errorComponent: () => <div>Error loading employee group data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

