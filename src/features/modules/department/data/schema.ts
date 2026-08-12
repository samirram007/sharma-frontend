import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { z } from 'zod'

export const departmentSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  status: ActiveInactiveStatusSchema.default('active'),
})
export type Department = z.infer<typeof departmentSchema>
export const departmentListSchema = z.array(departmentSchema)
export type DepartmentList = z.infer<typeof departmentListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Role is required.' }),
  status: z.string().min(1, { message: 'Status is required.' }),
  isEdit: z.boolean(),
})

export type DepartmentForm = z.infer<typeof formSchema>
