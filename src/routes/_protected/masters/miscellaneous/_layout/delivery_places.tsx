import DeliveryPlace from '@/features/modules/delivery_place'
import { deliveryPlaceQueryOptions } from '@/features/modules/delivery_place/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute(
  '/_protected/masters/miscellaneous/_layout/delivery_places',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(deliveryPlaceQueryOptions()),
  component: () => {
    const { data: state } = useSuspenseQuery(deliveryPlaceQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>
        <DeliveryPlace data={state?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading state data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})
