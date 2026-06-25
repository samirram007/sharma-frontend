import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const PURCHASE_VOUCHER_TYPE_ID = 1005

export const PurchaseVoucherSchema = voucherSchema
export type PurchaseVoucher = z.infer<typeof PurchaseVoucherSchema>

export const PurchaseVoucherListSchema = z.array(PurchaseVoucherSchema)
export type PurchaseVoucherList = z.infer<typeof PurchaseVoucherListSchema>

export const PurchaseFormSchema = PurchaseVoucherSchema
    .extend({
        isEdit: z.boolean().optional(),
    })
    .omit({
        id: true,
    })

export type PurchaseVoucherForm = z.infer<typeof PurchaseFormSchema>

