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
