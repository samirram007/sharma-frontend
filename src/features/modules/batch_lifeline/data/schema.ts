import { z } from 'zod'

/** What a lifeline line is: an ordinary movement, an opening journal or a
 * year-end CLOSING snapshot marker. */
export const lifelineKindSchema = z.enum(['movement', 'opening', 'closing'])

export const lifelineRowSchema = z.object({
  key: z.string(),
  /** The (item, godown) bucket this line belongs to. */
  bucketKey: z.string(),
  itemId: z.number(),
  itemName: z.string(),
  itemCode: z.string().nullable(),
  unitCode: z.string().nullable(),
  noOfDecimalPlaces: z.number().catch(2),
  godownId: z.number(),
  godownName: z.string().nullable(),
  godownCode: z.string().nullable(),
  batchNo: z.string(),
  mfgDate: z.string().nullable(),
  expiryDate: z.string().nullable(),
  serialNo: z.string().nullable(),
  remarks: z.string().nullable(),
  voucherId: z.number(),
  voucherNo: z.string().nullable(),
  voucherDate: z.string().nullable(),
  voucherTypeId: z.number().nullable(),
  voucherTypeName: z.string().nullable(),
  journalType: z.string().nullable(),
  kind: lifelineKindSchema,
  movementType: z.string(),
  quantity: z.number(),
  rate: z.number().catch(0),
  amount: z.number().catch(0),
  /** Signed quantity/value this line contributes (0 for snapshot markers). */
  signedQuantity: z.number().catch(0),
  signedAmount: z.number().catch(0),
  /** False when the line is a restatement or a snapshot (no balance change). */
  applied: z.boolean().catch(true),
  restatesOpening: z.boolean().catch(false),
  runningBalance: z.number(),
  runningValue: z.number().catch(0),
  fiscalYearId: z.number().nullable().catch(null),
  fiscalYearName: z.string().nullable().catch(null),
  yearKey: z.string().catch('none'),
  transfer: z.boolean().catch(false),
  transferPeerGodownId: z.number().nullable().catch(null),
  transferPeerGodownName: z.string().nullable().catch(null),
})

/** Per-(item, godown) subtotal for one fiscal year. */
export const lifelineYearBucketSchema = z.object({
  key: z.string(),
  fiscalYearId: z.number().nullable().catch(null),
  name: z.string().nullable().catch(null),
  startDate: z.string().nullable().catch(null),
  endDate: z.string().nullable().catch(null),
  itemId: z.number(),
  itemName: z.string(),
  itemCode: z.string().nullable().catch(null),
  unitCode: z.string().nullable().catch(null),
  noOfDecimalPlaces: z.number().catch(2),
  godownId: z.number(),
  godownName: z.string().nullable().catch(null),
  godownCode: z.string().nullable().catch(null),
  carriedIn: z.number().catch(0),
  carriedInValue: z.number().catch(0),
  carriedOut: z.number().catch(0),
  carriedOutValue: z.number().catch(0),
  inQuantity: z.number().catch(0),
  outQuantity: z.number().catch(0),
  inValue: z.number().catch(0),
  outValue: z.number().catch(0),
  openingQuantity: z.number().catch(0),
  openingRestated: z.boolean().catch(false),
  rowCount: z.number().catch(0),
  movementCount: z.number().catch(0),
})

export const lifelineYearSchema = z.object({
  key: z.string(),
  fiscalYearId: z.number().nullable().catch(null),
  name: z.string().nullable().catch(null),
  startDate: z.string().nullable().catch(null),
  endDate: z.string().nullable().catch(null),
  rowCount: z.number().catch(0),
  movementCount: z.number().catch(0),
  carriedIn: z.number().catch(0),
  carriedInValue: z.number().catch(0),
  carriedOut: z.number().catch(0),
  carriedOutValue: z.number().catch(0),
  inQuantity: z.number().catch(0),
  outQuantity: z.number().catch(0),
  inValue: z.number().catch(0),
  outValue: z.number().catch(0),
  openingQuantity: z.number().catch(0),
  openingRestated: z.boolean().catch(false),
  /** True when the quantity totals span buckets with different units. */
  hasMixedUnits: z.boolean().catch(false),
  buckets: z.array(lifelineYearBucketSchema).catch([]),
})

export const lifelineBucketSchema = z.object({
  key: z.string(),
  itemId: z.number(),
  itemName: z.string(),
  itemCode: z.string().nullable().catch(null),
  unitCode: z.string().nullable().catch(null),
  noOfDecimalPlaces: z.number().catch(2),
  godownId: z.number(),
  godownName: z.string().nullable().catch(null),
  godownCode: z.string().nullable().catch(null),
  mfgDate: z.string().nullable().catch(null),
  expiryDate: z.string().nullable().catch(null),
  daysSinceMfg: z.number().nullable().catch(null),
  daysToExpiry: z.number().nullable().catch(null),
  expiryStatus: z.enum(['expired', 'expiring', 'valid', 'none']).catch('none'),
  openingQuantity: z.number().catch(0),
  snapshotQuantity: z.number().nullable().catch(null),
  inQuantity: z.number().catch(0),
  outQuantity: z.number().catch(0),
  inValue: z.number().catch(0),
  outValue: z.number().catch(0),
  closingQuantity: z.number().catch(0),
  closingValue: z.number().catch(0),
  rowCount: z.number().catch(0),
  movementCount: z.number().catch(0),
  firstDate: z.string().nullable().catch(null),
  lastDate: z.string().nullable().catch(null),
  firstMovementDate: z.string().nullable().catch(null),
  lastMovementDate: z.string().nullable().catch(null),
})

export const lifelineTotalsSchema = z.object({
  rowCount: z.number().catch(0),
  movementCount: z.number().catch(0),
  openingRowCount: z.number().catch(0),
  snapshotRowCount: z.number().catch(0),
  restatedOpeningCount: z.number().catch(0),
  transferCount: z.number().catch(0),
  bucketCount: z.number().catch(0),
  inQuantity: z.number().catch(0),
  outQuantity: z.number().catch(0),
  inValue: z.number().catch(0),
  outValue: z.number().catch(0),
  closingQuantity: z.number().catch(0),
  closingValue: z.number().catch(0),
  firstDate: z.string().nullable().catch(null),
  lastDate: z.string().nullable().catch(null),
  firstMovementDate: z.string().nullable().catch(null),
  lastMovementDate: z.string().nullable().catch(null),
})

export const lifelineMetaSchema = z.object({
  rowCount: z.number().catch(0),
  limit: z.number().catch(0),
  truncated: z.boolean().catch(false),
  seedRowCount: z.number().catch(0),
  seedTruncated: z.boolean().catch(false),
  includesClosingSnapshots: z.boolean().catch(true),
  expiryWithinDays: z.number().catch(90),
  filters: z
    .object({
      itemId: z.number().nullable().catch(null),
      godownId: z.number().nullable().catch(null),
      fromDate: z.string().nullable().catch(null),
      toDate: z.string().nullable().catch(null),
      batchNo: z.string().catch(''),
    })
    .catch({
      itemId: null,
      godownId: null,
      fromDate: null,
      toDate: null,
      batchNo: '',
    }),
})

export const batchLifelineSchema = z.object({
  batchNo: z.string().catch(''),
  asOnDate: z.string().nullable().catch(null),
  rows: z.array(lifelineRowSchema).catch([]),
  years: z.array(lifelineYearSchema).catch([]),
  buckets: z.array(lifelineBucketSchema).catch([]),
  totals: lifelineTotalsSchema,
  meta: lifelineMetaSchema,
})

export type LifelineKind = z.infer<typeof lifelineKindSchema>
export type LifelineRow = z.infer<typeof lifelineRowSchema>
export type LifelineYearBucket = z.infer<typeof lifelineYearBucketSchema>
export type LifelineYear = z.infer<typeof lifelineYearSchema>
export type LifelineBucket = z.infer<typeof lifelineBucketSchema>
export type LifelineTotals = z.infer<typeof lifelineTotalsSchema>
export type LifelineMeta = z.infer<typeof lifelineMetaSchema>
export type BatchLifeline = z.infer<typeof batchLifelineSchema>
