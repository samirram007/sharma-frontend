import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { z } from 'zod'

export const shiftSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  status: ActiveInactiveStatusSchema.default('active'),
})
export type Shift = z.infer<typeof shiftSchema>
export const shiftListSchema = z.array(shiftSchema)
export type ShiftList = z.infer<typeof shiftListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Role is required.' }),
  status: z.string().min(1, { message: 'Status is required.' }),
  isEdit: z.boolean(),
})

export type ShiftForm = z.infer<typeof formSchema>
