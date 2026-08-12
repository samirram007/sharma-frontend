import { z } from 'zod'

export const godownSetupSchema = z.object({
  godownId: z.number(),
  godownName: z.string(),
  prefilledQuantity: z.number(),
})

export type GodownSetup = z.infer<typeof godownSetupSchema>

export const ledgerSetupSchema = z.object({
  ledgerId: z.number(),
  ledgerName: z.string(),
  ledgerCode: z.string().nullable(),
  nature: z.string().nullable(),
  natureType: z.string().nullable(),
  prefilledBalance: z.number(),
})

export type LedgerSetup = z.infer<typeof ledgerSetupSchema>

export const stockItemSetupSchema = z.object({
  itemId: z.number(),
  itemName: z.string(),
  unitCode: z.string().nullable(),
  unitName: z.string().nullable(),
  noOfDecimalPlaces: z.number(),
  godowns: z.array(godownSetupSchema),
})

export type StockItemSetup = z.infer<typeof stockItemSetupSchema>

export const openingBalanceSetupSchema = z.object({
  currentFiscalYear: z.object({
    id: z.number(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  }),
  previousFiscalYear: z
    .object({
      id: z.number(),
      name: z.string(),
      isClosed: z.boolean(),
    })
    .nullable(),
  hasExistingOpening: z.boolean(),
  ledgers: z.array(ledgerSetupSchema),
  totalLedgers: z.number(),
  stockItems: z.array(stockItemSetupSchema),
  totalStockItems: z.number(),
  godowns: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      code: z.string().nullable(),
    }),
  ),
})

export type OpeningBalanceSetup = z.infer<typeof openingBalanceSetupSchema>

// Input schemas for the form
export const ledgerEntrySchema = z.object({
  ledgerId: z.number(),
  ledgerName: z.string(),
  amount: z.coerce.number().min(0).default(0),
  nature: z.string().nullable(),
  natureType: z.string().nullable(),
})

export type LedgerEntry = z.infer<typeof ledgerEntrySchema>

export const godownEntrySchema = z.object({
  godownId: z.number(),
  godownName: z.string(),
  quantity: z.coerce.number().min(0).default(0),
})

export type GodownEntry = z.infer<typeof godownEntrySchema>

export const stockEntrySchema = z.object({
  itemId: z.number(),
  itemName: z.string(),
  unitCode: z.string().nullable(),
  noOfDecimalPlaces: z.number(),
  godowns: z.array(godownEntrySchema),
})

export type StockEntry = z.infer<typeof stockEntrySchema>

// Store response
export const openingBalanceStoreResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  openingJournalVoucherId: z.number().optional(),
  voucherNo: z.string().optional(),
})

export type OpeningBalanceStoreResponse = z.infer<
  typeof openingBalanceStoreResponseSchema
>

// Status response
export const openingBalanceStatusSchema = z.object({
  hasExistingOpening: z.boolean(),
  openingVoucherId: z.number().optional(),
  voucherNo: z.string().optional(),
  fiscalYear: z.object({
    id: z.number(),
    name: z.string(),
  }),
})

export type OpeningBalanceStatus = z.infer<typeof openingBalanceStatusSchema>
