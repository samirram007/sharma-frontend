import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const SALES_ORDER_VOUCHER_TYPE_ID = 5002

export const salesOrderVoucherSchema = voucherSchema
export type SalesOrderVoucher = z.infer<typeof salesOrderVoucherSchema>

export const salesOrderVoucherListSchema = z.array(salesOrderVoucherSchema)
export type SalesOrderVoucherList = z.infer<typeof salesOrderVoucherListSchema>

export const salesOrderFormSchema = salesOrderVoucherSchema
  .extend({
    isEdit: z.boolean().optional(),
  })
  .omit({
    id: true,
  })

export type SalesOrderVoucherForm = z.infer<typeof salesOrderFormSchema>
