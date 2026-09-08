import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { z } from 'zod'

export const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().nullish(),
  username: z.string().nullish(),
  userType: z.string().nullish(),
  // .catch() coerces null/undefined/invalid values (e.g. rows created before
  // the status column existed) to 'active' instead of failing the whole list parse.
  status: ActiveInactiveStatusSchema.catch('active'),
  avatar: z.string().nullish(),

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
