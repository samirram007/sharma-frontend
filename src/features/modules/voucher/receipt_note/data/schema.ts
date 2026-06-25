
import { z } from 'zod';
import { voucherSchema } from '../../data-schema/voucher-schema';

export const receiptNoteSchema = voucherSchema.extend({
})
export type ReceiptNoteSchema = z.infer<typeof receiptNoteSchema>
export const receiptNoteListSchema = z.array(receiptNoteSchema)
export type ReceiptNoteList = z.infer<typeof receiptNoteListSchema>



export const formSchema = receiptNoteSchema.extend({
  isEdit: z.boolean().optional(),
}).omit({
  id: true,
})

export type ReceiptNoteForm = z.infer<typeof formSchema>