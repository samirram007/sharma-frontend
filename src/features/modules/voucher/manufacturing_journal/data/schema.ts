import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const MANUFACTURING_JOURNAL_VOUCHER_TYPE_ID = 2006

export const ManufacturingJournalVoucherSchema = voucherSchema
export type ManufacturingJournalVoucher = z.infer<
  typeof ManufacturingJournalVoucherSchema
>

export const ManufacturingJournalVoucherListSchema = z.array(
  ManufacturingJournalVoucherSchema,
)
export type ManufacturingJournalVoucherList = z.infer<
  typeof ManufacturingJournalVoucherListSchema
>

export const ManufacturingJournalFormSchema =
  ManufacturingJournalVoucherSchema.extend({
    isEdit: z.boolean().optional(),
  }).omit({
    id: true,
  })

export type ManufacturingJournalVoucherForm = z.infer<
  typeof ManufacturingJournalFormSchema
>
