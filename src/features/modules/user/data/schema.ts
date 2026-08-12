import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { z } from 'zod'

export const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().nullish(),
  username: z.string().nullish(),
  userType: z.string().nullish(),
  status: ActiveInactiveStatusSchema.default('active'),

  roleIds: z.array(z.number().int().positive()).nullish(),
})
export type User = z.infer<typeof userSchema>
export const userListSchema = z.array(userSchema)
export type UserList = z.infer<typeof userListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().min(1, { message: 'email is required.' }),
  status: z.string().min(1, { message: 'Status is required.' }),
  username: z.string().nullish(),
  userType: z.string().nullish(),
  isEdit: z.boolean(),
})

export type UserForm = z.infer<typeof formSchema>
