import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { z } from 'zod'
import { permissionListSchema } from '../../permission/data/schema'
// import { permissionListSchema } from '../../permission/data/schema'

// export const RolePermissionSchema: z.ZodType<any> = z.object({
//   id: z.number().int().positive(),
//   roleId: z.number().int().positive(),
//   appModuleFeatureId: z.number().int().positive(),
//   isAllowed: z.boolean(),

// })
// export type RolePermission = z.infer<typeof RolePermissionSchema>
export const roleSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  status: ActiveInactiveStatusSchema.default('active'),
  permissions: z
    .lazy(() => permissionListSchema)
    .optional()
    .nullable(),
})

export const userRoleSchema = z.object({
  userId: z.number().int().positive(),
  roleId: z.number().int().positive(),
})

export type UserRole = z.infer<typeof userRoleSchema>

export type Role = z.infer<typeof roleSchema>
export const roleListSchema = z.array(roleSchema)
export type RoleList = z.infer<typeof roleListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Role is required.' }),
  status: z.string().min(1, { message: 'Status is required.' }),
  isEdit: z.boolean(),
})

export type RoleForm = z.infer<typeof formSchema>
