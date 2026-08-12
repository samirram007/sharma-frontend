import { z } from 'zod'

export const menuFeatureSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  code: z.string(),
  status: z.string(),
  description: z.string().nullable().optional(),
  action: z.string().nullable().optional(),
  appModuleId: z.number().int().optional(),
  rolePermission: z
    .object({
      id: z.number().int().optional(),
      roleId: z.number().int(),
      appModuleFeatureId: z.number().int(),
      isAllowed: z.boolean(),
    })
    .nullable()
    .optional(),
})

export type MenuFeature = z.infer<typeof menuFeatureSchema>

export const menuFeatureListSchema = z.array(menuFeatureSchema)
