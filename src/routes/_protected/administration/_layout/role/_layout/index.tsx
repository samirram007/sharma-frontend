import Role from '@/features/modules/role';
import { roleQueryOptions } from '@/features/modules/role/data/queryOptions';


import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';
import { Suspense } from 'react';

export const Route = createFileRoute(
  '/_protected/administration/_layout/role/_layout/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(roleQueryOptions()),
  component: () => {
    const { data: role } = useSuspenseQuery(roleQueryOptions())

    return (
      <Suspense fallback={<Loader className="animate-spin bg-amber-600" />}>
        <Role data={role?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading roles.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

