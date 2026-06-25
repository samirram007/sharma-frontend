import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const PHYSICAL_STOCK_VOUCHER_TYPE_ID = 2007

export const PhysicalStockVoucherSchema = voucherSchema
export type PhysicalStockVoucher = z.infer<typeof PhysicalStockVoucherSchema>

export const PhysicalStockVoucherListSchema = z.array(PhysicalStockVoucherSchema)
export type PhysicalStockVoucherList = z.infer<typeof PhysicalStockVoucherListSchema>

export const PhysicalStockFormSchema = PhysicalStockVoucherSchema
    .extend({
        isEdit: z.boolean().optional(),
    })
    .omit({
        id: true,
    })

export type PhysicalStockVoucherForm = z.infer<typeof PhysicalStockFormSchema>
