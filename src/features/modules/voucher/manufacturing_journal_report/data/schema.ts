import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'
import { voucherTypeSchema } from '@/features/modules/voucher_type/data/schema'
import { companySchema } from '@/features/modules/company/data/schema'
import { fiscalYearSchema } from '@/features/modules/fiscal_year/data/schema'

export const manufacturingJournalReportSchema = voucherSchema.extend({
  voucherType: voucherTypeSchema,
  company: companySchema.nullish(),
  fiscalYear: fiscalYearSchema.nullish(),
  referencedBy: z
    .array(
      z.object({
        id: z.number().int().positive().nullish(),
        voucherId: z.number().int().positive().nullish(),
        refVoucherId: z.number().int().positive().nullish(),
        type: z.string().nullable(),
      }),
    )
    .nullish(),
  // Consumption (OUT) / Production (IN) summary attached by the backend
  consumptionQty: z.number().nullish(),
  productionQty: z.number().nullish(),
  consumptionAmount: z.number().nullish(),
  productionAmount: z.number().nullish(),
})

export type ManufacturingJournalReportSchema = z.infer<
  typeof manufacturingJournalReportSchema
>

export const manufacturingJournalReportListSchema = z.array(
  manufacturingJournalReportSchema,
)
export type ManufacturingJournalReportList = z.infer<
  typeof manufacturingJournalReportListSchema
>

// Grouped by stock item (backend returns snake_case keys)
export const groupedByStockItemSchema = z.object({
  stock_item_id: z.number(),
  stock_item_name: z.string(),
  voucher_count: z.number(),
  total_out_quantity: z.number(),
  total_in_quantity: z.number(),
  total_out_amount: z.number(),
  total_in_amount: z.number(),
})
export type GroupedByStockItemSchema = z.infer<typeof groupedByStockItemSchema>

// Grouped by godown
export const groupedByGodownSchema = z.object({
  godown_id: z.number(),
  godown_name: z.string(),
  voucher_count: z.number(),
  total_out_quantity: z.number(),
  total_in_quantity: z.number(),
})
export type GroupedByGodownSchema = z.infer<typeof groupedByGodownSchema>

// Grouped by date
export const groupedByDateSchema = z.object({
  voucher_date: z.string(),
  voucher_count: z.number(),
  total_out_quantity: z.number(),
  total_in_quantity: z.number(),
  total_out_amount: z.number(),
  total_in_amount: z.number(),
})
export type GroupedByDateSchema = z.infer<typeof groupedByDateSchema>

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
