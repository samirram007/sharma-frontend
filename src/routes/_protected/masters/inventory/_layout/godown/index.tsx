import Godown from '@/features/modules/godown';
import { godownQueryOptions } from '@/features/modules/godown/data/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/masters/inventory/_layout/godown/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(godownQueryOptions()),
  component: () => {
    const { data: godown } = useSuspenseQuery(godownQueryOptions())

    return <Godown data={godown?.data} />
  },
  errorComponent: () => <div>Error loading godown data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

