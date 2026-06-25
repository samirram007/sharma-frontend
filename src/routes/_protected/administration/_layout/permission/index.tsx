import Permission from '@/features/modules/permission';
import { permissionQueryOptions } from '@/features/modules/permission/data/queryOptions';


import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/administration/_layout/permission/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(permissionQueryOptions()),
  component: () => {
    const { data: permission } = useSuspenseQuery(permissionQueryOptions())

    return <Permission data={permission?.data} />
  },
  errorComponent: () => <div>Error loading permissions.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

