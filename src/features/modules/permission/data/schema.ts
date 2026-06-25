import { z } from 'zod';
import { appModuleFeatureSchema } from '../../app_module_feature/data/schema';
import { roleSchema } from '../../role/data/schema';




export const permissionSchema = z.object({
  id: z.number().int().positive().optional(),
  roleId: z.coerce.number().int().positive(),
  appModuleFeatureId: z.coerce.number().int().positive(),
  role: z.lazy(() => roleSchema).nullable().optional(),
  isAllowed: z.boolean(),
  appModuleFeature: z.lazy(() => appModuleFeatureSchema).nullable().optional(),



})
export type Permission = z.infer<typeof permissionSchema>
export type RolePermission = z.infer<typeof permissionSchema>
export const permissionListSchema = z.array(permissionSchema)
export type PermissionList = z.infer<typeof permissionListSchema>



export const formSchema = z
  .object({
    roleId: z.coerce.number().int().positive(),
    appModuleFeatureId: z.coerce.number().int().positive(),
    role: z.lazy(() => roleSchema).nullable().optional(),
    appModuleFeature: appModuleFeatureSchema.nullable().optional(),
    isAllowed: z.boolean(),
    isEdit: z.boolean(),
  })

export type PermissionForm = z.infer<typeof formSchema>