import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const CREDIT_NOTE_VOUCHER_TYPE_ID = 1008

export const CreditNoteVoucherSchema = voucherSchema
export type CreditNoteVoucher = z.infer<typeof CreditNoteVoucherSchema>

export const CreditNoteVoucherListSchema = z.array(CreditNoteVoucherSchema)
export type CreditNoteVoucherList = z.infer<typeof CreditNoteVoucherListSchema>

export const CreditNoteFormSchema = CreditNoteVoucherSchema
    .extend({
        isEdit: z.boolean().optional(),
    })
    .omit({
        id: true,
    })

export type CreditNoteVoucherForm = z.infer<typeof CreditNoteFormSchema>
