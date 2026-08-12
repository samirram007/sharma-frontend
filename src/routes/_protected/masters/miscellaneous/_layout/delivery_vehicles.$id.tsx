import { deliveryVehicleQueryOptions } from '@/features/modules/delivery_vehicle/data/queryOptions'
import DeliveryVehicle from '@/features/modules/delivery_vehicle'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'
import z from 'zod'

const paramsSchema = z.object({
  id: z.union([
    z.literal('new'),
    z.coerce.number().refine((n) => !Number.isNaN(n), {
      message: 'Invalid number',
    }),
  ]),
})
export const Route = createFileRoute(
  '/_protected/masters/miscellaneous/_layout/delivery_vehicles/$id',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    return context.queryClient.ensureQueryData(deliveryVehicleQueryOptions(id))
  },

  component: () => {
    const { data: deliveryVehicles } = useSuspenseQuery(
      deliveryVehicleQueryOptions(),
    )
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>
        <DeliveryVehicle data={deliveryVehicles?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})
