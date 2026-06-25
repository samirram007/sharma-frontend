import Grade from '@/features/modules/grade';
import { gradeQueryOptions } from '@/features/modules/grade/data/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/masters/payroll/_layout/grade/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(gradeQueryOptions()),
  component: () => {
    const { data: grade } = useSuspenseQuery(gradeQueryOptions())

    return <Grade data={grade?.data} />
  },
  errorComponent: () => <div>Error loading grade data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

