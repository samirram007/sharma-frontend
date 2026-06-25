
import Shift from '@/features/modules/shift';
import { shiftQueryOptions } from '@/features/modules/shift/data/queryOptions';

import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/masters/payroll/_layout/shift/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(shiftQueryOptions()),
  component: () => {
    const { data: shift } = useSuspenseQuery(shiftQueryOptions())

    return <Shift data={shift?.data} />
  },
  errorComponent: () => <div>Error loading shift data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

