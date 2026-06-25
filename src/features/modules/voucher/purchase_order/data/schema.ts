import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const PURCHASE_ORDER_VOUCHER_TYPE_ID = 5001

export const purchaseOrderVoucherSchema = voucherSchema
export type PurchaseOrderVoucher = z.infer<typeof purchaseOrderVoucherSchema>

export const purchaseOrderVoucherListSchema = z.array(purchaseOrderVoucherSchema)
export type PurchaseOrderVoucherList = z.infer<typeof purchaseOrderVoucherListSchema>

export const purchaseOrderFormSchema = purchaseOrderVoucherSchema
    .extend({
        isEdit: z.boolean().optional(),
    })
    .omit({
        id: true,
    })

export type PurchaseOrderVoucherForm = z.infer<typeof purchaseOrderFormSchema>
