import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const SALES_VOUCHER_TYPE_ID = 1006

export const SalesVoucherSchema = voucherSchema
export type SalesVoucher = z.infer<typeof SalesVoucherSchema>

export const SalesVoucherListSchema = z.array(SalesVoucherSchema)
export type SalesVoucherList = z.infer<typeof SalesVoucherListSchema>

export const SalesFormSchema = SalesVoucherSchema.extend({
  isEdit: z.boolean().optional(),
}).omit({
  id: true,
})

export type SalesVoucherForm = z.infer<typeof SalesFormSchema>
