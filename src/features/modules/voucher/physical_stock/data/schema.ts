import { z } from 'zod'
import { voucherSchema } from '../../data-schema/voucher-schema'

export const PHYSICAL_STOCK_VOUCHER_TYPE_ID = 2007

export const PhysicalStockVoucherSchema = voucherSchema
export type PhysicalStockVoucher = z.infer<typeof PhysicalStockVoucherSchema>

export const PhysicalStockVoucherListSchema = z.array(PhysicalStockVoucherSchema)
export type PhysicalStockVoucherList = z.infer<typeof PhysicalStockVoucherListSchema>

export const PhysicalStockFormSchema = PhysicalStockVoucherSchema
    .extend({
        isEdit: z.boolean().optional(),
    })
    .omit({
        id: true,
    })

export type PhysicalStockVoucherForm = z.infer<typeof PhysicalStockFormSchema>

// ── Physical Stock Count sheet (legacy physical-stock-counts model) ─────────
// The POS grid (pos/components/*, pos/utils/count-math.ts) edits a count sheet
// with snake_case fields matching the backend physical_stock_counts endpoints
// (populate / verify / generate-adjustment). These types are consumed via
// `import type` only; kept as plain TS types because the count-date cell
// stores both Date and 'YYYY-MM-DD' string values.

export type PhysicalStockCountStatus = 'draft' | 'verified' | 'adjusted'

export interface PhysicalStockCountItem {
  id?: number
  stock_item_id?: number | null
  stock_item?: { id: number; name: string; code?: string | null } | null
  batch_no?: string | null
  mfg_date?: Date | string | null
  expiry_date?: Date | string | null
  serial_no?: string | null
  system_quantity?: number | null
  physical_quantity?: number | null
  rate?: number | null
  remarks?: string | null
}

export interface PhysicalStockCountForm {
  id?: number
  godownId?: number | null
  godown?: { id: number; name: string; code?: string | null } | null
  countDate?: Date | string | null
  status: PhysicalStockCountStatus
  remarks?: string | null
  items: PhysicalStockCountItem[]
}
