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

export const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required.' }),
    email: z.string().min(1, { message: 'Email is required.' }),
    status: z.string().min(1, { message: 'Status is required.' }),
    username: z.string().nullish(),
    userType: z.string().nullish(),
    // Optional: leave empty to keep the existing password (edit) or generate
    // a random one server-side (create — backend defaults when omitted).
    password: z
      .string()
      .trim()
      .min(6, { message: 'Password must be at least 6 characters.' })
      .optional()
      .or(z.literal('')),
    isEdit: z.boolean(),
  })
  // Strip the password key entirely when it is empty so the API receives no
  // password field (keeps the current password on update, random on create).
  .transform((values) => {
    const { password, ...rest } = values
    return password ? { ...rest, password } : rest
  })

export type UserForm = z.input<typeof formSchema>
export type UserFormOutput = z.output<typeof formSchema>
