import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { z } from 'zod'
import { appModuleFeatureSchema } from '../../app_module_feature/data/schema'

export const MenuSchema = z.object({
  id: z.number().int().positive(),
  appModuleFeatureId: z.number().int().positive(),
  menuName: z.string().min(1),
  route: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  parentId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().default(0),
  status: ActiveInactiveStatusSchema.default('active'),
  isVisible: z.boolean().default(true),
  isGroup: z.boolean().default(false),
  description: z.string().nullable().optional(),
  feature: appModuleFeatureSchema.nullable().optional(),
  parent: z.object({
    id: z.number().int(),
    menuName: z.string(),
  }).nullable().optional(),
})

export type Menu = z.infer<typeof MenuSchema>

export const MenuListSchema = z.array(MenuSchema)
export type MenuList = z.infer<typeof MenuListSchema>

/** Recursive tree node for the hierarchy tree view. */
export const MenuTreeNodeSchema: z.ZodType<MenuTreeNode> = z.lazy(() =>
  MenuSchema.extend({
    children: z.array(MenuTreeNodeSchema).default([]),
  })
)
export type MenuTreeNode = Menu & {
  children: MenuTreeNode[]
}

export const MenuTreeSchema = z.array(MenuTreeNodeSchema)
export type MenuTree = z.infer<typeof MenuTreeSchema>

export const formSchema = z.object({
  appModuleFeatureId: z.coerce.number().int().positive({ message: 'Feature is required.' }),
  menuName: z.string().min(1, { message: 'Menu name is required.' }),
  route: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  parentId: z.coerce.number().int().positive().nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: z.string().min(1, { message: 'Status is required.' }),
  isVisible: z.boolean().default(true),
  isGroup: z.boolean().default(false),
  description: z.string().nullable().optional(),
  isEdit: z.boolean(),
})

export type MenuForm = z.infer<typeof formSchema>
