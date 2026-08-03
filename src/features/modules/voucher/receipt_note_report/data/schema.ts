import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'
import { voucherTypeSchema } from '@/features/modules/voucher_type/data/schema'
import { companySchema } from '@/features/modules/company/data/schema'
import { fiscalYearSchema } from '@/features/modules/fiscal_year/data/schema'

export const receiptNoteReportSchema = voucherSchema.extend({
  voucherType: voucherTypeSchema,
  company: companySchema.nullish(),
  fiscalYear: fiscalYearSchema.nullish(),
  referencedBy: z.array(z.object({
    id: z.number().int().positive().nullish(),
    voucherId: z.number().int().positive().nullish(),
    refVoucherId: z.number().int().positive().nullish(),
    type: z.string().nullable(),
  })).nullish(),
  paymentStatus: z.string().nullish(),
})

export type ReceiptNoteReportSchema = z.infer<typeof receiptNoteReportSchema>

export const receiptNoteReportListSchema = z.array(receiptNoteReportSchema)
export type ReceiptNoteReportList = z.infer<typeof receiptNoteReportListSchema>

// Grouped by ledger (backend returns snake_case keys)
export const groupedByLedgerSchema = z.object({
  ledger_id: z.number(),
  ledger_name: z.string(),
  voucher_count: z.number(),
  total_debit: z.number(),
  total_credit: z.number(),
  total_amount: z.number(),
})
export type GroupedByLedgerSchema = z.infer<typeof groupedByLedgerSchema>

// Grouped by date
export const groupedByDateSchema = z.object({
  voucher_date: z.string(),
  voucher_count: z.number(),
  total_amount: z.number(),
})
export type GroupedByDateSchema = z.infer<typeof groupedByDateSchema>

// Grouped by stock item
export const groupedByStockItemSchema = z.object({
  stock_item_id: z.number(),
  stock_item_name: z.string(),
  voucher_count: z.number(),
  total_quantity: z.number(),
  total_amount: z.number(),
})
export type GroupedByStockItemSchema = z.infer<typeof groupedByStockItemSchema>

// Grouped by godown
export const groupedByGodownSchema = z.object({
  godown_id: z.number(),
  godown_name: z.string(),
  voucher_count: z.number(),
  total_quantity: z.number(),
  total_billing_quantity: z.number(),
})
export type GroupedByGodownSchema = z.infer<typeof groupedByGodownSchema>

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
