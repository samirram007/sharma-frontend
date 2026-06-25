import Designation from '@/features/modules/designation';
import { designationQueryOptions } from '@/features/modules/designation/data/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/masters/payroll/_layout/designation/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(designationQueryOptions()),
  component: () => {
    const { data: designation } = useSuspenseQuery(designationQueryOptions())

    return <Designation data={designation?.data} />
  },
  errorComponent: () => <div>Error loading designation data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

