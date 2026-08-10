import { z } from 'zod'

// Item summary from the grid
export const runningBalanceItemSchema = z.object({
  itemId: z.number(),
  itemName: z.string(),
  unitCode: z.string().nullable(),
  unitName: z.string().nullable(),
  noOfDecimalPlaces: z.number().nullable(),
  openingQuantity: z.number(),
  inwardQuantity: z.number(),
  outwardQuantity: z.number(),
  closingQuantity: z.number(),
})

export type RunningBalanceItem = z.infer<typeof runningBalanceItemSchema>

// Transaction detail
export const runningBalanceTransactionSchema = z.object({
  voucherId: z.number().nullable(),
  voucherType: z.string(),
  voucherNo: z.string(),
  voucherDate: z.string().nullable(),
  inwardQuantity: z.number(),
  outwardQuantity: z.number(),
  runningBalance: z.number(),
  isOpening: z.boolean(),
  godownDetails: z
    .array(
      z.object({
        godownId: z.number().nullable(),
        godownName: z.string().nullable(),
        inwardQuantity: z.number(),
        outwardQuantity: z.number(),
        netQuantity: z.number(),
        // Per-godown batch/serial detail lines (e.g. SKADJ physical-count
        // adjustments) — returned by the backend getRunningBalance() as
        // camelCased detailLines.
        detailLines: z
          .array(
            z.object({
              batchNo: z.string().nullable(),
              serialNo: z.string().nullable(),
              mfgDate: z.string().nullable(),
              expiryDate: z.string().nullable(),
              movementType: z.string(),
              quantity: z.number(),
              rate: z.number().nullable(),
              amount: z.number().nullable(),
              remarks: z.string().nullable(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
})

export type RunningBalanceTransaction = z.infer<typeof runningBalanceTransactionSchema>

// Detail response for a single item
export const runningBalanceDetailSchema = z.object({
  item: z.object({
    itemId: z.number(),
    itemName: z.string(),
    unitCode: z.string().nullable(),
    unitName: z.string().nullable(),
    noOfDecimalPlaces: z.number(),
  }),
  openingQuantity: z.number(),
  totalInward: z.number(),
  totalOutward: z.number(),
  closingQuantity: z.number(),
  transactions: z.array(runningBalanceTransactionSchema),
})

export type RunningBalanceDetail = z.infer<typeof runningBalanceDetailSchema>

// Godown-level running balance summary
export const runningBalanceGodownSchema = z.object({
  godownId: z.number(),
  godownName: z.string(),
  godownCode: z.string().nullable(),
  openingQuantity: z.number(),
  inwardQuantity: z.number(),
  outwardQuantity: z.number(),
  closingQuantity: z.number(),
})

export type RunningBalanceGodown = z.infer<typeof runningBalanceGodownSchema>

// Items within a godown
export const godownRunningBalanceItemSchema = z.object({
  itemId: z.number(),
  itemName: z.string(),
  unitCode: z.string().nullable(),
  unitName: z.string().nullable(),
  noOfDecimalPlaces: z.number().nullable(),
  openingQuantity: z.number(),
  inwardQuantity: z.number(),
  outwardQuantity: z.number(),
  closingQuantity: z.number(),
})

export type GodownRunningBalanceItem = z.infer<typeof godownRunningBalanceItemSchema>

export const godownRunningBalanceResponseSchema = z.object({
  godown: z.object({
    godownId: z.number(),
    godownName: z.string(),
    godownCode: z.string().nullable(),
  }),
  items: z.array(godownRunningBalanceItemSchema),
})

export type GodownRunningBalanceResponse = z.infer<typeof godownRunningBalanceResponseSchema>
