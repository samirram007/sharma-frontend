import { z } from 'zod';
import { deliveryPlaceSchema } from '../../delivery_place/data/schema';
import { stockUnitSchema } from '../../stock_unit/data/schema';
import { transporterSchema } from '../../transporter/data/schema';
import { godownSchema } from '../../godown/data/schema';




export const deliveryRouteSchema = z.object({

  id: z.number().int().positive().optional(),
  transporterId: z.number().int().positive(),
  sourcePlaceId: z.number().int().positive(),
  destinationPlaceId: z.number().int().positive(),
  vehicleNo: z.string().min(1),
  distanceKm: z.coerce.number().min(0).optional(),
  estimatedTimeInMinutes: z.coerce.number().min(0).optional(),
  rate: z.coerce.number().min(0).optional(),
  sourcePlace: godownSchema.nullish(),
  destinationPlace: deliveryPlaceSchema.nullish(),
  rateUnitId: z.number().int().positive().optional(),
  transporter: transporterSchema.nullish(),

  rateUnit: stockUnitSchema.nullish(),
})
export type DeliveryRoute = z.infer<typeof deliveryRouteSchema>
export const deliveryRouteListSchema = z.array(deliveryRouteSchema)
export type DeliveryRouteList = z.infer<typeof deliveryRouteListSchema>

export const formSchema = deliveryRouteSchema
  .omit({
    id: true,
  })
  .extend({
    isEdit: z.boolean(),
  })

export type DeliveryRouteForm = z.infer<typeof formSchema>





