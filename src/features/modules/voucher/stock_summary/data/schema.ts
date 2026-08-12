import { voucherTypeSchema } from '@/features/modules/voucher_type/data/schema'
import { z } from 'zod'

export const voucherDetailsSchema = z.object({
  voucherId: z.number().int().positive(),
  voucherNo: z.string().min(1),
  voucherDate: z.string(),
  voucherType: z.string().min(1),
  openingQuantity: z.coerce.number().nullish(),
  openingAmount: z.coerce.number().nullish(),
  inwardQuantity: z.coerce.number().nullish(),
  inwardAmount: z.coerce.number().nullish(),
  outwardQuantity: z.coerce.number().nullish(),
  outwardAmount: z.coerce.number().nullish(),
  closingQuantity: z.coerce.number().nullish(),
  closingAmount: z.coerce.number().nullish(),
})

export type VoucherDetailsSchema = z.infer<typeof voucherDetailsSchema>

export const godownDetailsSchema = z.object({
  godownId: z.number().int().positive(),
  godownName: z.string().min(1),
  openingQuantity: z.coerce.number().nullish(),
  openingAmount: z.coerce.number().nullish(),
  inwardQuantity: z.coerce.number().nullish(),
  inwardAmount: z.coerce.number().nullish(),
  outwardQuantity: z.coerce.number().nullish(),
  outwardAmount: z.coerce.number().nullish(),
  closingQuantity: z.coerce.number().nullish(),
  closingAmount: z.coerce.number().nullish(),
})

export type GodownDetailsSchema = z.infer<typeof godownDetailsSchema>

export const stockInHandSchema = z.object({
  itemId: z.number().int().positive(),
  itemName: z.string().min(1),
  unitCode: z.string().min(1),
  unitName: z.string().min(1),
  noOfDecimalPlaces: z.number().int().min(0).max(6),
  openingQuantity: z.coerce.number().nullish(),
  openingAmount: z.coerce.number().nullish(),
  inwardQuantity: z.coerce.number().nullish(),
  inwardAmount: z.coerce.number().nullish(),
  outwardQuantity: z.coerce.number().nullish(),
  outwardAmount: z.coerce.number().nullish(),
  closingQuantity: z.coerce.number().nullish(),
  closingAmount: z.coerce.number().nullish(),
})

export type StockInHandSchema = z.infer<typeof stockInHandSchema>

export const stockInHandListSchema = z.array(stockInHandSchema)
export type StockInHandListSchema = z.infer<typeof stockInHandListSchema>

export const stockInHandItemWiseSchema = stockInHandSchema.extend({
  godownDetails: z.array(godownDetailsSchema),
})

export type StockInHandItemWiseSchema = z.infer<
  typeof stockInHandItemWiseSchema
>
export const stockInHandItemWiseListSchema = z.array(stockInHandItemWiseSchema)
export type StockInHandItemWiseListSchema = z.infer<
  typeof stockInHandItemWiseListSchema
>

export const stockInHandGodownWiseSchema = godownDetailsSchema.extend({
  itemDetails: z.array(stockInHandSchema),
})

export type StockInHandGodownWiseSchema = z.infer<
  typeof stockInHandGodownWiseSchema
>

export const stockInHandGodownWiseListSchema = z.array(
  stockInHandGodownWiseSchema,
)
export type StockInHandGodownWiseListSchema = z.infer<
  typeof stockInHandGodownWiseListSchema
>

export const stockInHandZoneWiseSchema = z.object({
  zoneId: z.number().int().positive(),
  zoneName: z.string().min(1),
  openingQuantity: z.coerce.number().nullish(),
  openingAmount: z.coerce.number().nullish(),
  inwardQuantity: z.coerce.number().nullish(),
  inwardAmount: z.coerce.number().nullish(),
  outwardQuantity: z.coerce.number().nullish(),
  outwardAmount: z.coerce.number().nullish(),
  closingQuantity: z.coerce.number().nullish(),
  closingAmount: z.coerce.number().nullish(),
  godownDetails: z.array(stockInHandGodownWiseSchema),
})
export type StockInHandZoneWiseSchema = z.infer<
  typeof stockInHandZoneWiseSchema
>

export const stockInHandZoneWiseListSchema = z.array(stockInHandZoneWiseSchema)
export type StockInHandZoneWiseListSchema = z.infer<
  typeof stockInHandZoneWiseListSchema
>

export const StockInHandVoucherWiseSchema = stockInHandSchema.extend({
  voucherDetails: z.array(voucherDetailsSchema),
})
export type StockInHandVoucherWiseSchema = z.infer<
  typeof StockInHandVoucherWiseSchema
>

export const StockInHandVoucherWiseListSchema = z.array(
  StockInHandVoucherWiseSchema,
)
export type StockInHandVoucherWiseListSchema = z.infer<
  typeof StockInHandVoucherWiseListSchema
>

export const stockSummarySchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  voucherNo: z.string().min(1),
  voucherDate: z.string(),
  referenceNo: z.string().nullish(),
  referenceDate: z.string().nullish(),
  voucherTypeId: z.number().int(),
  stockJournalId: z.number().int().nullish(),
  remarks: z.string().nullish(),
  voucherType: voucherTypeSchema,
  amount: z.coerce.number().nullish(),
  partyLedger: z
    .object({
      id: z.number().int().positive(),
      name: z.string().min(1),
      code: z.string().nullish(),
      ledgerableType: z.string().nullish(),
      ledgerableId: z.coerce.number().int().nullish(),
      currentBalance: z.coerce.number().nullish(),
    })
    .nullish(),
  transactionLedger: z
    .object({
      id: z.number().int().positive(),
      name: z.string().min(1),
      code: z.string().nullish(),
      accountGroupId: z.coerce.number().int().nullish(),
      currentBalance: z.coerce.number().nullish(),
    })
    .nullish(),
  // status: ActiveInactiveStatusSchema.default(ActiveInactiveStatusSchema.options[0].value),
})

export type StockSummarySchema = z.infer<typeof stockSummarySchema>

export const stockSummaryListSchema = z.array(stockSummarySchema)
export type StockSummaryList = z.infer<typeof stockSummaryListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Code is required.' }).nullish(),
  status: z.string().min(1, { message: 'Status is required.' }),

  description: z
    .string()
    .min(1, { message: 'Description is required.' })
    .nullish(),

  isEdit: z.boolean(),
})

// ─────────────────────────────────────────────────────────────
//  Closing Stock report (GET /stock_summaries/closing_stock)
// ─────────────────────────────────────────────────────────────
// Response shape (camelCased by ClosingStockResource) mirrors the backend
// closingStock() payload: item → godown → batch tree with source metadata.

export const closingStockBatchSchema = z.object({
  batchNo: z.string().nullable(),
  mfgDate: z.string().nullable(),
  expiryDate: z.string().nullable(),
  quantity: z.number(),
  amount: z.number().nullable(),
  rate: z.number().nullable(),
})
export type ClosingStockBatchSchema = z.infer<typeof closingStockBatchSchema>

export const ClosingStockGodownDetailsSchema = z.object({
  godownId: z.number().int().nullable(),
  godownName: z.string().nullable(),
  godownCode: z.string().nullable(),
  closingQuantity: z.number(),
  closingAmount: z.number(),
  batchDetails: z.array(closingStockBatchSchema).optional(),
})
// Same-named type alias so `import type { ClosingStockGodownDetailsSchema }`
// resolves to the inferred data type (used by closing_stock.tsx).
export type ClosingStockGodownDetailsSchema = z.infer<
  typeof ClosingStockGodownDetailsSchema
>
export type ClosingStockGodownDetails = ClosingStockGodownDetailsSchema

export const ClosingStockItemSchema = z.object({
  itemId: z.number().int(),
  itemName: z.string(),
  unitCode: z.string().nullable(),
  unitName: z.string().nullable(),
  noOfDecimalPlaces: z.number(),
  closingQuantity: z.number(),
  closingAmount: z.number(),
  rate: z.number().nullable(),
  godownDetails: z.array(ClosingStockGodownDetailsSchema),
})
export type ClosingStockItemSchema = z.infer<typeof ClosingStockItemSchema>
export type ClosingStockItem = ClosingStockItemSchema

export const ClosingStockSchema = z.object({
  source: z.enum(['closing_journal', 'running']),
  asOfDate: z.string().nullable(),
  closingVoucherId: z.number().int().nullable(),
  closingVoucherNo: z.string().nullable(),
  closingDate: z.string().nullable(),
  fiscalYear: z
    .object({
      id: z.number(),
      name: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    })
    .nullable(),
  totalItems: z.number(),
  totalQuantity: z.number().nullable(),
  totalAmount: z.number().nullable(),
  items: z.array(ClosingStockItemSchema),
})
export type ClosingStockSchema = z.infer<typeof ClosingStockSchema>
export type ClosingStock = ClosingStockSchema
