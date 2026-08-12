import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { z } from 'zod'

export const designationSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  status: ActiveInactiveStatusSchema.default('active'),
})
export type Designation = z.infer<typeof designationSchema>
export const designationListSchema = z.array(designationSchema)
export type DesignationList = z.infer<typeof designationListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Role is required.' }),
  status: z.string().min(1, { message: 'Status is required.' }),
  isEdit: z.boolean(),
})

export type DesignationForm = z.infer<typeof formSchema>
