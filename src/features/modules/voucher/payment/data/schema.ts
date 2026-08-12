import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const PAYMENT_VOUCHER_TYPE_ID = 1002

export const paymentVoucherSchema = voucherSchema
export type PaymentVoucher = z.infer<typeof paymentVoucherSchema>

export const paymentVoucherListSchema = z.array(paymentVoucherSchema)
export type PaymentVoucherList = z.infer<typeof paymentVoucherListSchema>

export const paymentFormSchema = paymentVoucherSchema
  .extend({
    isEdit: z.boolean().optional(),
  })
  .omit({
    id: true,
  })

export type PaymentVoucherForm = z.infer<typeof paymentFormSchema>
