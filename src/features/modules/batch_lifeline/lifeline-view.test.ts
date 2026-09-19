import { describe, expect, it } from 'vitest'
import {
  ALL_BUCKETS,
  bucketLabel,
  bucketOptions,
  filterRows,
  godownOptions,
  itemOptions,
  lifelineSummary,
  selectionAsLifeline,
  yearsForBucket,
} from './lifeline-view'
import type {
  BatchLifeline,
  LifelineBucket,
  LifelineRow,
  LifelineYear,
} from './data/schema'

const KEY_A = '1\x1f1'
const KEY_B = '2\x1f1'

function makeBucket(overrides: Partial<LifelineBucket> = {}): LifelineBucket {
  return {
    key: KEY_A,
    itemId: 1,
    itemName: 'Item A',
    itemCode: 'ITEMA',
    unitCode: 'KG',
    noOfDecimalPlaces: 2,
    godownId: 1,
    godownName: 'Main Godown',
    godownCode: 'MAIN',
    mfgDate: null,
    expiryDate: null,
    daysSinceMfg: null,
    daysToExpiry: null,
    expiryStatus: 'none',
    openingQuantity: 0,
    snapshotQuantity: null,
    inQuantity: 100,
    outQuantity: 40,
    inValue: 1000,
    outValue: 480,
    closingQuantity: 60,
    closingValue: 520,
    rowCount: 2,
    movementCount: 2,
    firstDate: '2024-05-10',
    lastDate: '2024-06-01',
    firstMovementDate: '2024-05-10',
    lastMovementDate: '2024-06-01',
    ...overrides,
  }
}

function makeRow(overrides: Partial<LifelineRow> = {}): LifelineRow {
  return {
    key: `${KEY_A}:1`,
    bucketKey: KEY_A,
    itemId: 1,
    itemName: 'Item A',
    itemCode: 'ITEMA',
    unitCode: 'KG',
    noOfDecimalPlaces: 2,
    godownId: 1,
    godownName: 'Main Godown',
    godownCode: 'MAIN',
    batchNo: 'B1',
    mfgDate: null,
    expiryDate: null,
    serialNo: null,
    remarks: null,
    voucherId: 1,
    voucherNo: 'PURC-1',
    voucherDate: '2024-05-10',
    voucherTypeId: 1,
    voucherTypeName: 'Purchase',
    journalType: 'PURCHASE',
    kind: 'movement',
    movementType: 'in',
    quantity: 100,
    rate: 10,
    amount: 1000,
    signedQuantity: 100,
    signedAmount: 1000,
    applied: true,
    restatesOpening: false,
    runningBalance: 100,
    runningValue: 1000,
    fiscalYearId: 1,
    fiscalYearName: 'FY 2024-25',
    yearKey: '1',
    transfer: false,
    transferPeerGodownId: null,
    transferPeerGodownName: null,
    ...overrides,
  }
}

function makeYearBucket(
  key: string,
  overrides: Record<string, unknown> = {},
) {
  // Bucket A carries the two KG lines, bucket B the single NOS line — so the
  // year for one bucket must never show the other's numbers.
  const isB = key === KEY_B

  return {
    key,
    fiscalYearId: 1,
    name: 'FY 2024-25',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    itemId: isB ? 2 : 1,
    itemName: isB ? 'Item B' : 'Item A',
    itemCode: isB ? 'ITEMB' : 'ITEMA',
    unitCode: isB ? 'NOS' : 'KG',
    noOfDecimalPlaces: 2,
    godownId: 1,
    godownName: 'Main Godown',
    godownCode: 'MAIN',
    carriedIn: 0,
    carriedInValue: 0,
    carriedOut: isB ? 7 : 60,
    carriedOutValue: isB ? 700 : 520,
    inQuantity: isB ? 7 : 100,
    outQuantity: isB ? 0 : 40,
    inValue: isB ? 700 : 1000,
    outValue: isB ? 0 : 480,
    openingQuantity: 0,
    openingRestated: false,
    rowCount: isB ? 1 : 2,
    movementCount: isB ? 1 : 2,
    ...overrides,
  }
}

function makeYear(overrides: Partial<LifelineYear> = {}): LifelineYear {
  return {
    key: '1',
    fiscalYearId: 1,
    name: 'FY 2024-25',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    rowCount: 4,
    movementCount: 4,
    carriedIn: 0,
    carriedInValue: 0,
    carriedOut: 70,
    carriedOutValue: 1520,
    inQuantity: 107,
    outQuantity: 40,
    inValue: 1700,
    outValue: 480,
    openingQuantity: 0,
    openingRestated: false,
    hasMixedUnits: true,
    buckets: [makeYearBucket(KEY_A), makeYearBucket(KEY_B)],
    ...overrides,
  }
}

function makeLifeline(overrides: Partial<BatchLifeline> = {}): BatchLifeline {
  return {
    batchNo: 'B1',
    asOnDate: '2026-09-18',
    rows: [
      makeRow(),
      makeRow({
        key: `${KEY_A}:2`,
        voucherId: 2,
        voucherNo: 'SALE-1',
        voucherDate: '2024-06-01',
        movementType: 'out',
        journalType: 'SALE',
        quantity: 40,
        amount: 480,
        signedQuantity: -40,
        signedAmount: -480,
        runningBalance: 60,
        runningValue: 520,
      }),
      makeRow({
        key: `${KEY_B}:1`,
        bucketKey: KEY_B,
        itemId: 2,
        itemName: 'Item B',
        itemCode: 'ITEMB',
        unitCode: 'NOS',
        godownId: 1,
        godownName: 'Main Godown',
        voucherNo: 'PURC-2',
        quantity: 7,
        rate: 100,
        amount: 700,
        runningBalance: 7,
        runningValue: 700,
        transfer: true,
        transferPeerGodownId: 1,
      }),
    ],
    years: [makeYear()],
    buckets: [
      makeBucket(),
      makeBucket({
        key: KEY_B,
        itemId: 2,
        itemName: 'Item B',
        itemCode: 'ITEMB',
        unitCode: 'NOS',
        inQuantity: 7,
        outQuantity: 0,
        inValue: 700,
        outValue: 0,
        closingQuantity: 7,
        closingValue: 700,
        rowCount: 1,
        movementCount: 1,
        lastMovementDate: '2024-05-10',
      }),
    ],
    totals: {
      rowCount: 3,
      movementCount: 3,
      openingRowCount: 0,
      snapshotRowCount: 0,
      restatedOpeningCount: 0,
      transferCount: 1,
      bucketCount: 2,
      inQuantity: 107,
      outQuantity: 40,
      inValue: 1700,
      outValue: 480,
      closingQuantity: 67,
      closingValue: 1220,
      firstDate: '2024-05-10',
      lastDate: '2024-06-01',
      firstMovementDate: '2024-05-10',
      lastMovementDate: '2024-06-01',
    },
    meta: {
      rowCount: 3,
      limit: 1000,
      truncated: false,
      seedRowCount: 0,
      seedTruncated: false,
      includesClosingSnapshots: true,
      expiryWithinDays: 90,
      filters: {
        itemId: null,
        godownId: null,
        fromDate: null,
        toDate: null,
        batchNo: 'B1',
      },
    },
    ...overrides,
  }
}

describe('lifeline pickers', () => {
  it('labels and de-duplicates the bucket, item and godown options', () => {
    const lifeline = makeLifeline()

    expect(bucketLabel(lifeline.buckets[0])).toBe('Item A · Main Godown')
    expect(bucketOptions(lifeline.buckets).map((o) => o.value)).toEqual([
      KEY_A,
      KEY_B,
    ])
    expect(itemOptions(lifeline.buckets)).toEqual([
      { value: 1, label: 'Item A' },
      { value: 2, label: 'Item B' },
    ])
    // Both buckets sit in the same godown, so the godown list has one entry.
    expect(godownOptions(lifeline.buckets)).toEqual([
      { value: 1, label: 'Main Godown' },
    ])
  })

  it('falls back to the godown id when a bucket has no godown name', () => {
    expect(
      bucketLabel(makeBucket({ godownName: null, godownId: 9 })),
    ).toBe('Item A · Godown #9')
  })
})

describe('filterRows', () => {
  it('keeps everything for "all" and only the bucket otherwise', () => {
    const lifeline = makeLifeline()

    expect(filterRows(lifeline.rows, ALL_BUCKETS)).toHaveLength(3)
    expect(
      filterRows(lifeline.rows, KEY_A).map((row) => row.voucherNo),
    ).toEqual(['PURC-1', 'SALE-1'])
    expect(filterRows(lifeline.rows, KEY_B)).toHaveLength(1)
    expect(filterRows(lifeline.rows, 'missing')).toEqual([])
  })
})

describe('yearsForBucket', () => {
  it('passes the backend years through when nothing is pinned', () => {
    const lifeline = makeLifeline()
    expect(yearsForBucket(lifeline, ALL_BUCKETS)).toBe(lifeline.years)
  })

  it('swaps the year totals for one bucket so units never mix', () => {
    const lifeline = makeLifeline()
    const [year] = yearsForBucket(lifeline, KEY_B)

    expect(year.hasMixedUnits).toBe(false)
    expect(year.name).toBe('FY 2024-25')
    expect(year.inQuantity).toBe(7)
    expect(year.carriedOut).toBe(7) // bucket B's own closing, not the mixed total
    expect(year.buckets).toHaveLength(1)
    expect(year.buckets[0].key).toBe(KEY_B)
  })

  it('skips years the pinned bucket never appears in', () => {
    const lifeline = makeLifeline({
      years: [
        makeYear(),
        makeYear({
          key: '2',
          fiscalYearId: 2,
          name: 'FY 2025-26',
          buckets: [makeYearBucket(KEY_A)],
        }),
      ],
    })

    expect(yearsForBucket(lifeline, KEY_A).map((y) => y.key)).toEqual(['1', '2'])
    expect(yearsForBucket(lifeline, KEY_B).map((y) => y.key)).toEqual(['1'])
  })
})

describe('lifelineSummary', () => {
  it('uses the backend totals for the whole batch number and flags mixed units', () => {
    const summary = lifelineSummary(makeLifeline(), ALL_BUCKETS)

    expect(summary.label).toBe('All items and godowns')
    expect(summary.rowCount).toBe(3)
    expect(summary.closingQuantity).toBe(67)
    expect(summary.mixedUnits).toBe(true)
    expect(summary.unitCode).toBeNull()
  })

  it('uses one bucket only for a pinned bucket, with that bucket unit', () => {
    const summary = lifelineSummary(makeLifeline(), KEY_A)

    expect(summary.label).toBe('Item A · Main Godown')
    expect(summary.rowCount).toBe(2)
    expect(summary.closingQuantity).toBe(60)
    expect(summary.unitCode).toBe('KG')
    expect(summary.noOfDecimalPlaces).toBe(2)
    expect(summary.mixedUnits).toBe(false)
    expect(summary.movementCount).toBe(2)
    // Transfers and restatements are counted from the rows themselves.
    expect(summary.transferCount).toBe(0)
  })

  it('counts opening, snapshot, restated and transfer lines from the rows', () => {
    const lifeline = makeLifeline({
      rows: [
        makeRow({ kind: 'opening', restatesOpening: true, applied: false }),
        makeRow({ key: 'k2', kind: 'closing', movementType: 'in' }),
        makeRow({ key: 'k3', transfer: true }),
      ],
    })
    const summary = lifelineSummary(lifeline, KEY_A)

    expect(summary.openingRowCount).toBe(1)
    expect(summary.snapshotRowCount).toBe(1)
    expect(summary.restatedOpeningCount).toBe(1)
    expect(summary.transferCount).toBe(1)
  })

  it('falls back to the whole batch number when the bucket is unknown', () => {
    const summary = lifelineSummary(makeLifeline(), 'gone')
    expect(summary.label).toBe('All items and godowns')
    expect(summary.rowCount).toBe(3)
  })
})

describe('selectionAsLifeline', () => {
  it('returns the lifeline untouched for "all"', () => {
    const lifeline = makeLifeline()
    expect(selectionAsLifeline(lifeline, ALL_BUCKETS)).toBe(lifeline)
  })

  it('narrows rows, years, buckets and totals to the pinned bucket', () => {
    const selection = selectionAsLifeline(makeLifeline(), KEY_B)

    expect(selection.rows).toHaveLength(1)
    expect(selection.buckets).toHaveLength(1)
    expect(selection.years).toHaveLength(1)
    expect(selection.totals.bucketCount).toBe(1)
    expect(selection.totals.rowCount).toBe(1)
    expect(selection.totals.closingQuantity).toBe(7)
    expect(selection.totals.transferCount).toBe(1)
    // Untouched passthrough fields survive, so exports keep their context.
    expect(selection.batchNo).toBe('B1')
    expect(selection.meta.filters.batchNo).toBe('B1')
  })
})
