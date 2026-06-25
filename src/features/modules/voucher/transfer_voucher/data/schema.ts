import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const TRANSFER_VOUCHER_VOUCHER_TYPE_ID = 2005

export const TransferVoucherVoucherSchema = voucherSchema
export type TransferVoucherVoucher = z.infer<typeof TransferVoucherVoucherSchema>

export const TransferVoucherVoucherListSchema = z.array(TransferVoucherVoucherSchema)
export type TransferVoucherVoucherList = z.infer<typeof TransferVoucherVoucherListSchema>

export const TransferVoucherFormSchema = TransferVoucherVoucherSchema
    .extend({
        isEdit: z.boolean().optional(),
    })
    .omit({
        id: true,
    })

export type TransferVoucherVoucherForm = z.infer<typeof TransferVoucherFormSchema>
