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

/** Expiry state of a batch as on the report's as-on date. */
export const batchExpiryStatusSchema = z
  .enum(['expired', 'expiring', 'valid', 'none'])
  .catch('none')

// Reconciliation flags — one per integrity check the report runs.
export const batchFlagsSchema = z.object({
  /** Non-zero opening with no row in this FY's opening voucher. */
  carryForwardOpening: z.boolean().catch(false),
  /** Opening quantity disagrees with the opening-stock journal. */
  journalVariance: z.boolean().catch(false),
  /** Closing quantity is below zero (stock over-consumed). */
  negativeClosing: z.boolean().catch(false),
  /** No inward/outward movement inside the report window. */
  noMovement: z.boolean().catch(false),
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
  // Valuation — quantity × rate, so a batch carries a closing value.
  openingValue: z.number().catch(0),
  inwardValue: z.number().catch(0),
  outwardValue: z.number().catch(0),
  closingValue: z.number().catch(0),
  averageRate: z.number().catch(0),
  // Ageing — days measured against the report's as-on date.
  daysSinceMfg: z.number().nullable().catch(null),
  daysToExpiry: z.number().nullable().catch(null),
  expiryStatus: batchExpiryStatusSchema,
  // Activity summary (movements inside the window only).
  movementCount: z.number().catch(0),
  firstMovementDate: z.string().nullable().catch(null),
  lastMovementDate: z.string().nullable().catch(null),
  flags: batchFlagsSchema.catch({
    carryForwardOpening: false,
    journalVariance: false,
    negativeClosing: false,
    noMovement: false,
  }),
  issues: z.array(z.string()).catch([]),
  movements: z.array(batchMovementSchema),
  openingMovements: z.array(batchOpeningMovementSchema).default([]),
})

export const batchTotalsSchema = z.object({
  batchCount: z.number(),
  totalOpening: z.number(),
  totalOpeningAsPerJournal: z.number().catch(0),
  totalPrePeriodNet: z.number().catch(0),
  totalInward: z.number(),
  totalOutward: z.number(),
  totalClosing: z.number(),
  totalOpeningValue: z.number().catch(0),
  totalInwardValue: z.number().catch(0),
  totalOutwardValue: z.number().catch(0),
  totalClosingValue: z.number().catch(0),
  carryForwardCount: z.number().catch(0),
  journalVarianceCount: z.number().catch(0),
  negativeCount: z.number().catch(0),
  noMovementCount: z.number().catch(0),
  zeroClosingCount: z.number().catch(0),
  expiredCount: z.number().catch(0),
  expiringCount: z.number().catch(0),
})

export const batchPaginationSchema = z.object({
  page: z.number().catch(1),
  perPage: z.number().catch(0),
  total: z.number().catch(0),
  totalPages: z.number().catch(1),
  hasMore: z.boolean().catch(false),
})

/** A voucher type present in the current result set (the facet list). */
export const batchVoucherTypeSchema = z.object({
  id: z.number().nullable(),
  name: z.string().nullable(),
  code: z.string().nullable(),
  lineCount: z.number().catch(0),
})

export const batchBalancingReportSchema = z
  .object({
    // The 9010 / OPNSK opening voucher's date — the FY first day (e.g.
    // 1-Apr). The canonical "opening stock as on" date for the opening row.
    asOnDate: z.string().nullable().catch(null),
    // Movement window actually used by the backend: the explicit from/to
    // filters, or the fiscal-year bounds when no reporting period is set.
    fromDate: z.string().nullable().catch(null),
    toDate: z.string().nullable().catch(null),
    // Ageing reference date (the window end) + the expiring-soon threshold.
    ageingAsOnDate: z.string().nullable().catch(null),
    expiryWithinDays: z.number().catch(90),
    batches: z.array(batchBalanceSchema),
    totals: batchTotalsSchema,
    pagination: batchPaginationSchema.catch({
      page: 1,
      perPage: 0,
      total: 0,
      totalPages: 1,
      hasMore: false,
    }),
    sort: z
      .object({ by: z.string(), dir: z.string() })
      .catch({ by: 'item', dir: 'asc' }),
    voucherTypes: z.array(batchVoucherTypeSchema).catch([]),
  })
  .catch({
    // Older backends without the new fields still parse — labels fall back
    // to the reporting-period / FY-bounds wording.
    asOnDate: null,
    fromDate: null,
    toDate: null,
    ageingAsOnDate: null,
    expiryWithinDays: 90,
    batches: [],
    totals: {
      batchCount: 0,
      totalOpening: 0,
      totalOpeningAsPerJournal: 0,
      totalPrePeriodNet: 0,
      totalInward: 0,
      totalOutward: 0,
      totalClosing: 0,
      totalOpeningValue: 0,
      totalInwardValue: 0,
      totalOutwardValue: 0,
      totalClosingValue: 0,
      carryForwardCount: 0,
      journalVarianceCount: 0,
      negativeCount: 0,
      noMovementCount: 0,
      zeroClosingCount: 0,
      expiredCount: 0,
      expiringCount: 0,
    },
    pagination: { page: 1, perPage: 0, total: 0, totalPages: 1, hasMore: false },
    sort: { by: 'item', dir: 'asc' },
    voucherTypes: [],
  })

export type BatchMovement = z.infer<typeof batchMovementSchema>
export type BatchOpeningMovement = z.infer<typeof batchOpeningMovementSchema>
export type BatchBalance = z.infer<typeof batchBalanceSchema>
export type BatchFlags = z.infer<typeof batchFlagsSchema>
export type BatchTotals = z.infer<typeof batchTotalsSchema>
export type BatchPagination = z.infer<typeof batchPaginationSchema>
export type BatchVoucherType = z.infer<typeof batchVoucherTypeSchema>
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
