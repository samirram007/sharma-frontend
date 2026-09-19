import { describe, expect, it } from 'vitest'
import type { BatchBalance, BatchBalancingReport } from './data/schema'
import { buildCsv, EXPORT_COLUMNS, flattenForExport } from './export-utils'

function makeBatch(overrides: Partial<BatchBalance> = {}): BatchBalance {
  return {
    itemId: 1,
    itemName: 'Item A',
    itemCode: 'ITEMA',
    unitCode: 'MT',
    noOfDecimalPlaces: 2,
    godownId: 1,
    godownName: 'Main Godown',
    godownCode: 'MAIN',
    batchNo: 'B1',
    mfgDate: null,
    expiryDate: null,
    openingQuantity: 0.45,
    openingAsPerJournal: 0.45,
    prePeriodNet: 0,
    inwardQuantity: 0,
    outwardQuantity: 0,
    closingQuantity: 0.45,
    openingValue: 0,
    inwardValue: 0,
    outwardValue: 0,
    closingValue: 0,
    averageRate: 0,
    daysSinceMfg: null,
    daysToExpiry: null,
    expiryStatus: 'none',
    movementCount: 0,
    firstMovementDate: null,
    lastMovementDate: null,
    flags: {
      carryForwardOpening: false,
      journalVariance: false,
      negativeClosing: false,
      noMovement: false,
    },
    issues: [],
    movements: [],
    openingMovements: [
      {
        voucherId: 1,
        voucherNo: 'OPNS-1',
        voucherDate: '2026-04-01',
        voucherTypeName: 'Opening Stock',
        movementType: 'in',
        quantity: 0.45,
        rate: 5623.63,
        amount: 2530.63,
        remarks: null,
        kind: 'journal',
        balanceAfter: 0.45,
      },
    ],
    ...overrides,
  }
}

function makeReport(batches: BatchBalance[]): BatchBalancingReport {
  return {
    asOnDate: '2026-04-01',
    fromDate: '2026-04-01',
    toDate: '2027-03-31',
    ageingAsOnDate: '2027-03-31',
    expiryWithinDays: 90,
    batches,
    totals: {
      batchCount: batches.length,
      totalOpening: 0.45,
      totalOpeningAsPerJournal: 0.45,
      totalPrePeriodNet: 0,
      totalInward: 0,
      totalOutward: 0,
      totalClosing: 0.45,
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
    pagination: { page: 1, perPage: 100, total: batches.length, totalPages: 1, hasMore: false },
    sort: { by: 'item', dir: 'asc' },
    voucherTypes: [],
  }
}

/** A batch with a real trail — used by the valuation / flag assertions. */
function makeTradingBatch(overrides: Partial<BatchBalance> = {}) {
  return makeBatch({
    inwardQuantity: 20,
    outwardQuantity: 5,
    openingValue: 100,
    inwardValue: 240,
    outwardValue: 60,
    closingValue: 280,
    averageRate: 11.2,
    movementCount: 2,
    lastMovementDate: '2026-08-10',
    movements: [
      {
        voucherId: 2,
        voucherNo: 'PURC-2',
        voucherDate: '2026-08-01',
        voucherTypeName: 'Purchase',
        movementType: 'in',
        quantity: 20,
        rate: 12,
        amount: 240,
        remarks: null,
        runningBalance: 140,
      },
      {
        voucherId: 3,
        voucherNo: 'SALE-2',
        voucherDate: '2026-08-10',
        voucherTypeName: 'Sales',
        movementType: 'out',
        quantity: 5,
        rate: 12,
        amount: 60,
        remarks: null,
        runningBalance: 135,
      },
    ],
    ...overrides,
  })
}

describe('batch balancing export', () => {
  it('emits exactly one OPENING row per batch — no extra "Opening as on" summary row', () => {
    const rows = flattenForExport(makeReport([makeBatch()]))

    const openingRows = rows.filter((r) => r.movement === 'OPENING')
    expect(openingRows).toHaveLength(1)
    // The removed summary row would surface as a second OPENING line with an
    // empty voucher and the same balance — assert it never comes back.
    expect(
      rows.filter((r) => r.voucherNo === '' && r.detail === ''),
    ).toHaveLength(
      2, // the OPENING row + the CLOSING row only
    )
  })

  it('carries the opening trail balance into the OPENING row and closing balance into the CLOSING row', () => {
    const batch = makeBatch({
      openingQuantity: 120,
      inwardQuantity: 20,
      outwardQuantity: 10,
      closingQuantity: 130,
      movements: [
        {
          voucherId: 2,
          voucherNo: 'PURC-2',
          voucherDate: '2026-08-01',
          voucherTypeName: 'Purchase',
          movementType: 'in',
          quantity: 20,
          rate: 12,
          amount: 240,
          remarks: null,
          runningBalance: 140,
        },
        {
          voucherId: 3,
          voucherNo: 'SALE-2',
          voucherDate: '2026-09-05',
          voucherTypeName: 'Sale',
          movementType: 'out',
          quantity: 10,
          rate: 12,
          amount: 120,
          remarks: null,
          runningBalance: 130,
        },
      ],
    })
    const rows = flattenForExport(makeReport([batch]))

    expect(rows.map((r) => r.movement)).toEqual([
      'OPENING',
      'INWARD',
      'OUTWARD',
      'CLOSING',
    ])
    expect(rows[0].balance).toBe('120.00')
    expect(rows[1].balance).toBe('140.00')
    expect(rows[3].balance).toBe('130.00')
    // Movement detail rows keep their voucher context.
    expect(rows[1].voucherNo).toBe('PURC-2')
    expect(rows[2].voucherNo).toBe('SALE-2')
  })

  it('CSV contains exactly one OPENING line per batch and never a duplicate opening line', () => {
    const csv = buildCsv(
      makeReport([makeBatch(), makeBatch({ batchNo: 'B2' })]),
    )
    const lines = csv.replace(/^\uFEFF/, '').split('\n')

    // Header + 2 batches × (OPENING + CLOSING) rows.
    expect(lines).toHaveLength(5)
    const openingLines = lines.filter((l) => l.includes(',"OPENING",'))
    expect(openingLines).toHaveLength(2)
    // The removed summary row would have appeared as a third opening-ish
    // line repeating the opening balance — guard against regressions.
    // 2 batches × (OPENING + CLOSING) = 4 lines carrying the 0.45 balance.
    const balanceLines = lines.filter((l) => l.includes('"0.45"'))
    expect(balanceLines).toHaveLength(4)
  })

  it('exports rate, value, ageing and the batch flags on every row', () => {
    const batch = makeTradingBatch({
      expiryDate: '2027-03-01',
      daysToExpiry: -30,
      expiryStatus: 'expired',
      flags: {
        carryForwardOpening: true,
        journalVariance: true,
        negativeClosing: false,
        noMovement: false,
      },
    })
    const rows = flattenForExport(makeReport([batch]))
    const headers = EXPORT_COLUMNS.map((c) => c.header)

    expect(headers).toContain('Value')
    expect(headers).toContain('Days To Expiry')
    expect(headers).toContain('Flags')

    // Movement rows carry their own rate / value.
    const inward = rows.find((r) => r.movement === 'INWARD')!
    expect(inward.rate).toBe('12.00')
    expect(inward.value).toBe('240.00')

    // The closing row carries the batch valuation.
    const closing = rows.find((r) => r.movement === 'CLOSING')!
    expect(closing.rate).toBe('11.20')
    expect(closing.value).toBe('280.00')

    // Batch-level context repeats on every row so spreadsheet filters work.
    for (const row of rows) {
      expect(row.expiryDate).toBe('01 Mar 2027')
      expect(row.daysToExpiry).toBe('-30')
      expect(row.flags).toBe('No opening voucher; Opening variance')
    }
  })

  it('adds SUBTOTAL rows per item and an optional TOTAL row', () => {
    const report = makeReport([
      makeTradingBatch({ itemId: 1, itemName: 'Item A', batchNo: 'A1' }),
      makeTradingBatch({
        itemId: 1,
        itemName: 'Item A',
        batchNo: 'A2',
        inwardValue: 100,
        inwardQuantity: 10,
      }),
      makeTradingBatch({ itemId: 2, itemName: 'Item B', batchNo: 'B1' }),
    ])

    // Default: flat, one row per movement, no subtotals.
    expect(
      flattenForExport(report).filter((r) => r.movement === 'SUBTOTAL'),
    ).toHaveLength(0)

    const grouped = flattenForExport(report, { groupBy: 'item' })
    const subtotals = grouped.filter((r) => r.movement === 'SUBTOTAL')
    expect(subtotals).toHaveLength(2)
    expect(subtotals[0].itemName).toBe('Item A')
    expect(subtotals[0].detail).toContain('2 batch(es)')
    // Item A: inward 20 + 10 = 30 (counted from the batch aggregates).
    expect(subtotals[0].inward).toBe('30.00')
    expect(subtotals[1].itemName).toBe('Item B')

    const withTotals = flattenForExport(
      makeReport([makeTradingBatch({ inwardValue: 240 })]),
      { totals: true },
    )
    const total = withTotals.at(-1)!
    expect(total.movement).toBe('TOTAL')
    expect(total.detail).toBe('1 batch(es)')
  })

  it('groups godown subtotals by godown name', () => {
    const report = makeReport([
      makeTradingBatch({ batchNo: 'A1', godownId: 1, godownName: 'Main' }),
      makeTradingBatch({ batchNo: 'A2', godownId: 2, godownName: 'Store' }),
    ])

    const subtotals = flattenForExport(report, { groupBy: 'godown' }).filter(
      (r) => r.movement === 'SUBTOTAL',
    )

    expect(subtotals.map((r) => r.godownName)).toEqual(['Main', 'Store'])
  })
})
