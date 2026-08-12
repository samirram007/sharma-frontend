import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { z } from 'zod'

export const statusSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  status: ActiveInactiveStatusSchema.default('active'),
})

export type Status = z.infer<typeof statusSchema>

export const statusListSchema = z.array(statusSchema)
export type StatusList = z.infer<typeof statusListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Code is required.' }),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  status: z.string().min(1, { message: 'Status is required.' }),
  isEdit: z.boolean(),
})

export type StatusForm = z.infer<typeof formSchema>
