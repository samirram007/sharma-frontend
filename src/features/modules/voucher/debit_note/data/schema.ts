import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const DEBIT_NOTE_VOUCHER_TYPE_ID = 1007

export const DebitNoteVoucherSchema = voucherSchema
export type DebitNoteVoucher = z.infer<typeof DebitNoteVoucherSchema>

export const DebitNoteVoucherListSchema = z.array(DebitNoteVoucherSchema)
export type DebitNoteVoucherList = z.infer<typeof DebitNoteVoucherListSchema>

export const DebitNoteFormSchema = DebitNoteVoucherSchema.extend({
  isEdit: z.boolean().optional(),
}).omit({
  id: true,
})

export type DebitNoteVoucherForm = z.infer<typeof DebitNoteFormSchema>
