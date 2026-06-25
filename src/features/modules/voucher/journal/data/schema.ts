import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const JOURNAL_VOUCHER_TYPE_ID = 1004

export const journalVoucherSchema = voucherSchema
export type JournalVoucher = z.infer<typeof journalVoucherSchema>

export const journalVoucherListSchema = z.array(journalVoucherSchema)
export type JournalVoucherList = z.infer<typeof journalVoucherListSchema>

export const journalFormSchema = journalVoucherSchema
    .extend({
        isEdit: z.boolean().optional(),
    })
    .omit({
        id: true,
    })

export type JournalVoucherForm = z.infer<typeof journalFormSchema>
