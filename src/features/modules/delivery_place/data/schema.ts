import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status';
import { z } from 'zod';




export const deliveryPlaceSchema = z.object({

  id: z.number().int().positive().optional(),
  name: z
    .string()
    .min(1, { message: 'Name is required.' }),
  code: z
    .string()
    .min(1, { message: 'Role is required.' }),
  placeType: z.string().nullish(),
  isActive: z.boolean().optional(),
  status: ActiveInactiveStatusSchema.optional(),
})
export type DeliveryPlace = z.infer<typeof deliveryPlaceSchema>
export const deliveryPlaceListSchema = z.array(deliveryPlaceSchema)
export type DeliveryPlaceList = z.infer<typeof deliveryPlaceListSchema>

export const formSchema = deliveryPlaceSchema
  .extend({
    isEdit: z.boolean(),
  })

export type DeliveryPlaceForm = z.infer<typeof formSchema>


export type PlaceType = 'source' | 'destination' | 'transit' | 'pickup' | 'drop';


