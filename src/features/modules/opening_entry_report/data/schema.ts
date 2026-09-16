import { z } from 'zod'

const godownEntrySchema = z.object({
  id: z.number(),
  entryOrder: z.number().nullish(),
  godownId: z.number(),
  godownName: z.string().nullable(),
  batchNo: z.string().nullable(),
  mfgDate: z.string().nullable(),
  expiryDate: z.string().nullable(),
  actualQuantity: z.number(),
  remarks: z.string().nullable(),
})

const stockJournalEntrySchema = z.object({
  id: z.number(),
  entryOrder: z.number().nullish(),
  stockItemId: z.number(),
  stockItemName: z.string().nullable(),
  stockUnitId: z.number().nullish(),
  stockUnitName: z.string().nullable(),
  actualQuantity: z.number(),
  rate: z.number(),
  amount: z.number(),
  godownEntries: z.array(godownEntrySchema),
})

const stockJournalSchema = z.object({
  id: z.number(),
  journalNo: z.string().nullish(),
  journalDate: z.string().nullish(),
  type: z.string().nullish(),
  entries: z.array(stockJournalEntrySchema),
})

const voucherEntrySchema = z.object({
  id: z.number(),
  entryOrder: z.number().nullish(),
  accountLedgerId: z.number(),
  accountLedgerName: z.string().nullable(),
  nature: z.string().nullable(),
  natureCode: z.string().nullable(),
  debit: z.number(),
  credit: z.number(),
  remarks: z.string().nullable(),
})

const voucherSchema = z.object({
  id: z.number(),
  voucherNo: z.string().nullish(),
  voucherDate: z.string().nullish(),
  remarks: z.string().nullish(),
  createdAt: z.string().nullish(),
  voucherEntries: z.array(voucherEntrySchema),
  totalDebit: z.number(),
  totalCredit: z.number(),
  stockJournal: stockJournalSchema.nullable(),
})

export const openingEntryReportSchema = z.object({
  fiscalYear: z.object({
    id: z.number(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  }),
  vouchers: z.array(voucherSchema),
  totalVouchers: z.number(),
})

export type OpeningEntryReport = z.infer<typeof openingEntryReportSchema>
export type VoucherData = z.infer<typeof voucherSchema>
export type VoucherEntryData = z.infer<typeof voucherEntrySchema>
export type StockJournalEntryData = z.infer<typeof stockJournalEntrySchema>

export const groupedByLedgerSchema = z.object({
  ledgerId: z.number(),
  ledgerName: z.string(),
  voucherCount: z.number(),
  totalDebit: z.number(),
  totalCredit: z.number(),
  netBalance: z.number(),
})

export type GroupedByLedger = z.infer<typeof groupedByLedgerSchema>

// ── Opening Stock report (GET /stock_summaries/opening_stock) ──
// The backend returns the SAME payload pre-grouped both ways:
//   items[]  → item → godown → batch lines (item-wise view)
//   godowns[] → godown → item → batch lines (godown-wise view)
// plus the opening voucher reference and grand totals.

const openingStockBatchSchema = z.object({
  batchNo: z.string().nullable(),
  mfgDate: z.string().nullable(),
  expiryDate: z.string().nullable(),
  quantity: z.number(),
  rate: z.number(),
  amount: z.number(),
  remarks: z.string().nullable().optional(),
})

const openingStockItemInGodownSchema = z.object({
  itemId: z.number(),
  itemName: z.string(),
  itemCode: z.string().nullable(),
  unitCode: z.string().nullable(),
  noOfDecimalPlaces: z.number(),
  quantity: z.number(),
  amount: z.number(),
  batches: z.array(openingStockBatchSchema),
})

const openingStockItemSchema = z.object({
  itemId: z.number(),
  itemName: z.string(),
  itemCode: z.string().nullable(),
  unitCode: z.string().nullable(),
  unitName: z.string().nullable(),
  noOfDecimalPlaces: z.number(),
  quantity: z.number(),
  amount: z.number(),
  godowns: z.array(
    z.object({
      godownId: z.number(),
      godownName: z.string().nullable(),
      godownCode: z.string().nullable(),
      quantity: z.number(),
      amount: z.number(),
      batches: z.array(openingStockBatchSchema),
    }),
  ),
})

const openingStockGodownSchema = z.object({
  godownId: z.number(),
  godownName: z.string().nullable(),
  godownCode: z.string().nullable(),
  quantity: z.number(),
  amount: z.number(),
  items: z.array(openingStockItemInGodownSchema),
})

export const openingStockReportSchema = z.object({
  openingVoucher: z
    .object({
      voucherId: z.number(),
      voucherNo: z.string(),
      voucherDate: z.string().nullable(),
    })
    .nullable(),
  items: z.array(openingStockItemSchema),
  godowns: z.array(openingStockGodownSchema),
  totals: z.object({
    itemCount: z.number(),
    godownCount: z.number(),
    totalQuantity: z.number(),
    totalAmount: z.number(),
  }),
})

export type OpeningStockReport = z.infer<typeof openingStockReportSchema>
export type OpeningStockBatch = z.infer<typeof openingStockBatchSchema>
