import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const CONVERSION_JOURNAL_VOUCHER_TYPE_ID = 2008

export const ConversionJournalVoucherSchema = voucherSchema
export type ConversionJournalVoucher = z.infer<
  typeof ConversionJournalVoucherSchema
>

export const ConversionJournalVoucherListSchema = z.array(
  ConversionJournalVoucherSchema,
)
export type ConversionJournalVoucherList = z.infer<
  typeof ConversionJournalVoucherListSchema
>

export const ConversionJournalFormSchema =
  ConversionJournalVoucherSchema.extend({
    isEdit: z.boolean().optional(),
  }).omit({
    id: true,
  })

export type ConversionJournalVoucherForm = z.infer<
  typeof ConversionJournalFormSchema
>
