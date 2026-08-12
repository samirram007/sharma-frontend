import { z } from 'zod'
import { voucherTypeSchema } from '../../voucher_type/data/schema'

const voucherClassificationStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type voucherClassificationStatus = z.infer<
  typeof voucherClassificationStatusSchema
>

export const voucherClassificationSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1).nullable().optional(),
  description: z.string().nullable().optional(),
  status: voucherClassificationStatusSchema,
  inclusionRules: z.any().nullable().optional(),
  exclusionRules: z.any().nullable().optional(),
  defaultValue: z.union([z.number(), z.string()]).nullable().optional(),
  percentage: z.union([z.number(), z.string()]).nullable().optional(),
  voucherTypeId: z.number().int().positive().nullable().optional(),
  voucherType: z
    .lazy(() => voucherTypeSchema)
    .nullable()
    .optional(),
})
export type VoucherClassification = z.infer<typeof voucherClassificationSchema>

export const voucherClassificationListSchema = z.array(
  voucherClassificationSchema,
)
export type VoucherClassificationList = z.infer<
  typeof voucherClassificationListSchema
>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Code is required.' }),
  status: z.string().min(1, { message: 'Status is required.' }),
  voucherTypeId: z
    .number()
    .int()
    .positive()
    .min(1, { message: 'Voucher Type ID is required.' }),
  inclusionRules: z.any().nullable().optional(),
  exclusionRules: z.any().nullable().optional(),
  defaultValue: z.union([z.number(), z.string()]).nullable().optional(),
  percentage: z.union([z.number(), z.string()]).nullable().optional(),
  description: z.string().nullable().optional(),
  isEdit: z.boolean(),
})
export type VoucherClassificationForm = z.infer<typeof formSchema>
