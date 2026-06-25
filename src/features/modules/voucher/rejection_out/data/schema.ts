import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const REJECTION_OUT_VOUCHER_TYPE_ID = 2004

export const RejectionOutVoucherSchema = voucherSchema
export type RejectionOutVoucher = z.infer<typeof RejectionOutVoucherSchema>

export const RejectionOutVoucherListSchema = z.array(RejectionOutVoucherSchema)
export type RejectionOutVoucherList = z.infer<typeof RejectionOutVoucherListSchema>

export const RejectionOutFormSchema = RejectionOutVoucherSchema
    .extend({
        isEdit: z.boolean().optional(),
    })
    .omit({
        id: true,
    })

export type RejectionOutVoucherForm = z.infer<typeof RejectionOutFormSchema>
