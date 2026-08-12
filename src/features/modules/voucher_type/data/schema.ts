import { z } from 'zod'
import { voucherCategorySchema } from '../../voucher_category/data/schema'

const voucherTypeStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type voucherTypeStatus = z.infer<typeof voucherTypeStatusSchema>

export const voucherTypeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1).nullable().optional(),
  description: z.string().nullable().optional(),
  status: voucherTypeStatusSchema,
  icon: z.string().nullable().optional(),
  voucherCategoryId: z.number().int().positive(),
  voucherCategory: z.lazy(() => voucherCategorySchema.nullish()),
  voucherClassificationId: z.number().int().positive().nullable().optional(),
  voucherClassifications: z.array(z.any()).nullable().optional(),
})
export type VoucherType = z.infer<typeof voucherTypeSchema>

export const voucherTypeListSchema = z.array(voucherTypeSchema)
export type VoucherTypeList = z.infer<typeof voucherTypeListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Code is required.' }),
  status: z.string().min(1, { message: 'Status is required.' }),
  voucherCategoryId: z
    .number()
    .int()
    .positive()
    .min(1, { message: 'Voucher Category ID is required.' }),
  voucherClassificationId: z.number().int().positive().optional(),
  description: z.string().min(1, { message: 'Description is required.' }),
  icon: z.string().optional(),
  isEdit: z.boolean(),
})
export type VoucherTypeForm = z.infer<typeof formSchema>
