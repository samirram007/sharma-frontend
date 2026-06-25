import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status';
import { z } from 'zod';




// export const RolePermissionSchema: z.ZodType<any> = z.object({
//   id: z.number().int().positive(),
//   roleId: z.number().int().positive(),
//   appModuleFeatureId: z.number().int().positive(),
//   isAllowed: z.boolean(),

// })
// export type RolePermission = z.infer<typeof RolePermissionSchema>
export const gstRegistrationTypeSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  status: ActiveInactiveStatusSchema.default('active'),

})
export type GstRegistrationType = z.infer<typeof gstRegistrationTypeSchema>
export const gstRegistrationTypeListSchema = z.array(gstRegistrationTypeSchema)
export type GstRegistrationTypeList = z.infer<typeof gstRegistrationTypeListSchema>



export const formSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name is required.' }),
    status: z
      .string()
      .min(1, { message: 'Status is required.' }),
    isEdit: z.boolean(),
  })

export type GstRegistrationTypeForm = z.infer<typeof formSchema>