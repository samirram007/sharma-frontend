import Department from '@/features/modules/department';
import { departmentQueryOptions } from '@/features/modules/department/data/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/masters/payroll/_layout/department/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(departmentQueryOptions()),
  component: () => {
    const { data: department } = useSuspenseQuery(departmentQueryOptions())

    return <Department data={department?.data} />
  },
  errorComponent: () => <div>Error loading department data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

