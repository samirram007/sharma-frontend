import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { z } from 'zod'

export const employeeGroupSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().optional().nullish(),
  status: ActiveInactiveStatusSchema.default('active'),
})

export type EmployeeGroup = z.infer<typeof employeeGroupSchema>

export const employeeGroupListSchema = z.array(employeeGroupSchema)
export type EmployeeGroupList = z.infer<typeof employeeGroupListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Code is required.' }).nullish(),
  status: z.string().min(1, { message: 'Status is required.' }),
  isEdit: z.boolean(),
})
