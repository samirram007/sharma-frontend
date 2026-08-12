import Status from '@/features/modules/status'
import { statusQueryOptions } from '@/features/modules/status/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/administration/_layout/status/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(statusQueryOptions()),
  component: () => {
    const { data: status } = useSuspenseQuery(statusQueryOptions())

    return <Status data={status?.data} />
  },
  errorComponent: () => <div>Error loading status data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})
