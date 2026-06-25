import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status';
import { z } from 'zod';


export const uniqueQuantityCodeSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1).optional(),
  description: z.string().optional().nullish(),
  status: ActiveInactiveStatusSchema.default('active'),
  icon: z.string().optional(),
  quantityType: z.string().min(1),
})

export type UniqueQuantityCode = z.infer<typeof uniqueQuantityCodeSchema>

export const uniqueQuantityCodeListSchema = z.array(uniqueQuantityCodeSchema)
export type UniqueQuantityCodeList = z.infer<typeof uniqueQuantityCodeListSchema>


export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Code is required.' }).optional(),
  status: z.string().min(1, { message: 'Status is required.' }),
  description: z.string().nullable().optional(),
  icon: z.string().optional(),
  quantityType: z.string().min(1),
  isEdit: z.boolean(),
})

