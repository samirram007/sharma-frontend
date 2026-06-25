import { deliveryPlaceQueryOptions } from '@/features/modules/delivery_place/data/queryOptions'
import DeliveryRoute from '@/features/modules/delivery_route'
import { deliveryRouteQueryOptions } from '@/features/modules/delivery_route/data/queryOptions'
import { godownQueryOptions } from '@/features/modules/godown/data/queryOptions'
import { transporterQueryOptions } from '@/features/modules/transporter/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute(
  '/_protected/masters/miscellaneous/_layout/delivery_routes',
)({
  loader: async ({ context }) => {
    const client = context.queryClient;
    await Promise.all([
      client.ensureQueryData(transporterQueryOptions()),
      client.ensureQueryData(godownQueryOptions()),
      client.ensureQueryData(deliveryRouteQueryOptions()),
      client.ensureQueryData(deliveryPlaceQueryOptions()),
    ]);
    return {
      message: 'Delivery Routes and Places data loaded',
    };
  },
  component: () => {
    const { data: state } = useSuspenseQuery(deliveryRouteQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <DeliveryRoute data={state?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading state data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

