import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

// The "Opening Stock" (OPNSK) voucher type id is NOT stable across databases:
// legacy installs seeded it as 9010, fresh installs as 10004. Never hardcode
// it — resolve it at runtime via GET /vouchers/opening-stock/voucher-type
// (the backend looks it up by code 'OPNSK', the same lookup the date-lock
// enforcement uses).
export const OPENING_STOCK_VOUCHER_TYPE_CODE = 'OPNSK'

export const openingStockVoucherTypeSchema = z.object({
  id: z.number().int().positive(),
  code: z.string().min(1),
  name: z.string().min(1),
})
export type OpeningStockVoucherType = z.infer<typeof openingStockVoucherTypeSchema>

export const OpeningStockVoucherSchema = voucherSchema
export type OpeningStockVoucher = z.infer<typeof OpeningStockVoucherSchema>

export const OpeningStockVoucherListSchema = z.array(OpeningStockVoucherSchema)
export type OpeningStockVoucherList = z.infer<typeof OpeningStockVoucherListSchema>

export const OpeningStockFormSchema = OpeningStockVoucherSchema
  .extend({
    isEdit: z.boolean().optional(),
    // The OPNSK type id is resolved at runtime (see OPENING_STOCK_VOUCHER_TYPE_CODE)
    // — it is null until the backend responds, then stamped before saving.
    voucherTypeId: z.number().int().nullable().optional(),
  })
  .omit({
    id: true,
  })

export type OpeningStockVoucherForm = z.infer<typeof OpeningStockFormSchema>

// Shape of the previous year's closing stock payload returned by
// GET /vouchers/opening-stock/previous-year-closing. The closing voucher is
// serialized with the standard VoucherResource shape (camelCase, nested
// stockJournal → stockJournalEntries → stockJournalGodownEntries), so the
// opening stock form can pre-fill from it directly.
export interface PreviousYearClosingStockResponse {
  previousFiscalYear?: {
    id: number
    name: string
    isClosed?: boolean
  } | null
  // Where the closing data came from: the frozen CLSSK closing journal
  // ('closing_journal') or a live running balance computed from the previous
  // fiscal year's stock movements ('running' — used when no closing journal
  // exists, e.g. the previous year was never closed).
  source?: 'closing_journal' | 'running' | null
  closingVoucherNo?: string | null
  closingDate?: string | null
  closingVoucher?: OpeningStockVoucher | null
}
