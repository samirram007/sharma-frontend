import { z } from 'zod'

const fiscalYearRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
})

const balanceSheetLedgerSchema = z.object({
  ledgerId: z.number(),
  ledgerName: z.string(),
  nature: z.string(),
  balance: z.number(),
})

const godownEntrySchema = z.object({
  godownId: z.number(),
  godownName: z.string().nullable(),
  quantity: z.number(),
})

const stockItemSchema = z.object({
  itemId: z.number(),
  itemName: z.string().nullable(),
  totalQuantity: z.number(),
  godowns: z.array(godownEntrySchema),
})

export const openPreviewSchema = z.object({
  previousFiscalYear: fiscalYearRefSchema,
  newFiscalYear: fiscalYearRefSchema,
  balanceSheetLedgers: z.array(balanceSheetLedgerSchema),
  totalLedgers: z.number(),
  stockItems: z.array(stockItemSchema),
  totalStockItems: z.number(),
})

export type OpenPreview = z.infer<typeof openPreviewSchema>

export const openResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  openingJournalVoucherId: z.number().optional(),
  newFiscalYearId: z.number().optional(),
})

export type OpenResponse = z.infer<typeof openResponseSchema>
