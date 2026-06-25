import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status';
import { z } from 'zod';
import { transporterSchema } from '../../transporter/data/schema';

export const DeliveryVehicleTypes = ['truck', 'van', 'bike', 'car', 'other'] as const;
export type DeliveryVehicleType = (typeof DeliveryVehicleTypes)[number];


export const deliveryVehicleSchema = z.object({

  id: z.number().int().positive().optional(),
  transporterId: z.number().int().positive(),
  vehicleNumber: z.string().min(1, 'Vehicle Number is required'),
  vehicleType: z.string().min(1, 'Vehicle Type is required'),
  capacity: z.string().nullable().optional(),
  driverName: z.string().nullable().optional(),
  driverContact: z.string().nullable().optional(),
  description: z.string().optional(),
  transporter: transporterSchema.optional(),

  status: ActiveInactiveStatusSchema.optional(),
})
export type DeliveryVehicle = z.infer<typeof deliveryVehicleSchema>
export const deliveryVehicleListSchema = z.array(deliveryVehicleSchema)
export type DeliveryVehicleList = z.infer<typeof deliveryVehicleListSchema>

export const formSchema = deliveryVehicleSchema
  .omit({ id: true })
  .extend({
    isEdit: z.boolean(),
  })

export type DeliveryVehicleForm = z.infer<typeof formSchema>


export type PlaceType = 'source' | 'destination' | 'transit' | 'pickup' | 'drop';


