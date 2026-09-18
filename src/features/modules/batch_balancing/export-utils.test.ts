import { describe, expect, it } from 'vitest'
import type { BatchBalance, BatchBalancingReport } from './data/schema'
import { buildCsv, flattenForExport } from './export-utils'

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
    batches,
    totals: {
      batchCount: batches.length,
      totalOpening: 0.45,
      totalOpeningAsPerJournal: 0.45,
      totalPrePeriodNet: 0,
      totalInward: 0,
      totalOutward: 0,
      totalClosing: 0.45,
    },
  }
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
})
