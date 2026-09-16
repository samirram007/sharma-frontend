import { z } from 'zod'

// One chronological movement inside a batch bucket.
export const batchMovementSchema = z.object({
  voucherId: z.number(),
  voucherNo: z.string().nullable(),
  voucherDate: z.string().nullable(),
  voucherTypeName: z.string().nullable(),
  movementType: z.string(),
  quantity: z.number(),
  rate: z.number(),
  amount: z.number(),
  remarks: z.string().nullable(),
  serialNo: z.string().nullable().optional(),
  runningBalance: z.number(),
})

// An opening-side row: the opening stock journal itself ('journal', as on
// 1-Apr) or ordinary movements dated before the reporting-period start
// ('prePeriod', netted into the carried-forward opening).
export const batchOpeningMovementSchema = batchMovementSchema
  .omit({
    runningBalance: true,
  })
  .extend({
    kind: z.enum(['journal', 'prePeriod']).catch('prePeriod'),
    balanceAfter: z.number(),
  })

export const batchBalanceSchema = z.object({
  itemId: z.number(),
  itemName: z.string(),
  itemCode: z.string().nullable(),
  unitCode: z.string().nullable(),
  noOfDecimalPlaces: z.number(),
  godownId: z.number(),
  godownName: z.string().nullable(),
  godownCode: z.string().nullable(),
  batchNo: z.string(),
  mfgDate: z.string().nullable(),
  expiryDate: z.string().nullable(),
  openingQuantity: z.number(),
  openingAsPerJournal: z.number().catch(0),
  prePeriodNet: z.number().catch(0),
  inwardQuantity: z.number(),
  outwardQuantity: z.number(),
  closingQuantity: z.number(),
  movements: z.array(batchMovementSchema),
  openingMovements: z.array(batchOpeningMovementSchema).default([]),
})

export const batchBalancingReportSchema = z.object({
  batches: z.array(batchBalanceSchema),
  totals: z.object({
    batchCount: z.number(),
    totalOpening: z.number(),
    totalOpeningAsPerJournal: z.number().catch(0),
    totalPrePeriodNet: z.number().catch(0),
    totalInward: z.number(),
    totalOutward: z.number(),
    totalClosing: z.number(),
  }),
})

export type BatchMovement = z.infer<typeof batchMovementSchema>
export type BatchOpeningMovement = z.infer<typeof batchOpeningMovementSchema>
export type BatchBalance = z.infer<typeof batchBalanceSchema>
export type BatchBalancingReport = z.infer<typeof batchBalancingReportSchema>

// Batch suggestion entry for the batch-number search dropdown.
export const batchSuggestionSchema = z.object({
  batchNo: z.string(),
  itemId: z.number(),
  itemName: z.string(),
  godownId: z.number(),
  godownName: z.string().nullable().optional(),
})

export type BatchSuggestion = z.infer<typeof batchSuggestionSchema>
