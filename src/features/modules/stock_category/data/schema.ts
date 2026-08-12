import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { z } from 'zod'

export const stockCategorySchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1).nullish(),
  description: z.string().nullish(),
  status: ActiveInactiveStatusSchema.default('active'),
  icon: z.string().optional(),
  parentId: z.number().int().positive().optional().nullish(),
  parent: z
    .lazy(() => stockCategorySchema)
    .optional()
    .nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type StockCategory = z.infer<typeof stockCategorySchema>

export const stockCategoryListSchema = z.array(stockCategorySchema)
export type StockCategoryList = z.infer<typeof stockCategoryListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Code is required.' }).nullish(),
  status: z.string().min(1, { message: 'Status is required.' }),
  parentId: z.number().int().positive().optional().nullable(),
  description: z
    .string()
    .min(1, { message: 'Description is required.' })
    .nullish(),
  icon: z.string().optional(),
  isEdit: z.boolean(),
})
