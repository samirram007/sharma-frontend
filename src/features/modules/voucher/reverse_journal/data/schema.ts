import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const REVERSE_JOURNAL_VOUCHER_TYPE_ID = 1009

export const reverseJournalVoucherSchema = voucherSchema
export type ReverseJournalVoucher = z.infer<typeof reverseJournalVoucherSchema>

export const reverseJournalVoucherListSchema = z.array(
  reverseJournalVoucherSchema,
)
export type ReverseJournalVoucherList = z.infer<
  typeof reverseJournalVoucherListSchema
>

export const reverseJournalFormSchema = reverseJournalVoucherSchema
  .extend({
    isEdit: z.boolean().optional(),
  })
  .omit({
    id: true,
  })

export type ReverseJournalVoucherForm = z.infer<typeof reverseJournalFormSchema>
