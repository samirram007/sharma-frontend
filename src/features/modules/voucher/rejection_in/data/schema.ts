import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const REJECTION_IN_VOUCHER_TYPE_ID = 2003

export const RejectionInVoucherSchema = voucherSchema
export type RejectionInVoucher = z.infer<typeof RejectionInVoucherSchema>

export const RejectionInVoucherListSchema = z.array(RejectionInVoucherSchema)
export type RejectionInVoucherList = z.infer<
  typeof RejectionInVoucherListSchema
>

export const RejectionInFormSchema = RejectionInVoucherSchema.extend({
  isEdit: z.boolean().optional(),
}).omit({
  id: true,
})

export type RejectionInVoucherForm = z.infer<typeof RejectionInFormSchema>
