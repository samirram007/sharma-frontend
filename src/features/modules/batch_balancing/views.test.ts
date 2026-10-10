import { describe, expect, it } from 'vitest'
import type { BatchBalance } from './data/schema'
import {
  AGE_BANDS,
  BATCH_VIEWS,
  batchSeverity,
  buildPivot,
  buildRanked,
  CONSUMPTION_BANDS,
  countByIssue,
  EXPIRY_BANDS,
  groupBatches,
  groupByVoucherType,
  hasOpeningVariance,
  isZeroQuantity,
  issuesOf,
  mfgCohortKey,
  mfgCohortLabel,
  openingVariance,
  openingVarianceRatio,
  totalsFor,
  VARIANCE_BANDS,
  VELOCITY_BANDS,
  viewLayout,
} from './views'

function makeBatch(overrides: Partial<BatchBalance> = {}): BatchBalance {
  return {
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
    openingQuantity: 0,
    openingAsPerJournal: 0,
    prePeriodNet: 0,
    inwardQuantity: 0,
    outwardQuantity: 0,
    closingQuantity: 0,
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
    openingMovements: [],
    ...overrides,
  }
}

function movement(overrides: Partial<BatchBalance['movements'][number]>) {
  return {
    voucherId: 1,
    voucherNo: 'V-1',
    voucherDate: '2025-06-15',
    voucherTypeName: 'Purchase',
    movementType: 'in',
    quantity: 10,
    rate: 10,
    amount: 100,
    remarks: null,
    runningBalance: 10,
    ...overrides,
  }
}

describe('batch balancing view catalogue', () => {
  it('gives every view a layout and only groups the grouped layouts', () => {
    for (const view of BATCH_VIEWS) {
      expect([
        'flat',
        'grouped',
        'grid',
        'voucher-types',
        'ranked',
        'pivot',
      ]).toContain(viewLayout(view.id))
    }

    // Every view id in the catalogue is unique, so the select keys are stable.
    expect(new Set(BATCH_VIEWS.map((v) => v.id)).size).toBe(BATCH_VIEWS.length)

    expect(viewLayout('batch-wise')).toBe('flat')
    expect(viewLayout('grid')).toBe('grid')
    expect(viewLayout('voucher-type-wise')).toBe('voucher-types')
    expect(viewLayout('expiry-wise')).toBe('grouped')
    expect(viewLayout('ageing-wise')).toBe('grouped')
    expect(viewLayout('ranked')).toBe('ranked')
    expect(viewLayout('pivot')).toBe('pivot')

    // Only the grouped layouts produce groups — the page renders the others
    // from the batch list directly.
    const batches = [makeBatch()]
    expect(groupBatches(batches, 'batch-wise')).toEqual([])
    expect(groupBatches(batches, 'grid')).toEqual([])
    expect(groupBatches(batches, 'ranked')).toEqual([])
    expect(groupBatches(batches, 'pivot')).toEqual([])
  })
})

describe('totalsFor', () => {
  it('sums O/I/O/C, values and picks the first unit code', () => {
    const totals = totalsFor([
      makeBatch({
        openingQuantity: 10,
        inwardQuantity: 5,
        outwardQuantity: 2,
        closingQuantity: 13,
        closingValue: 130,
      }),
      makeBatch({
        batchNo: 'B2',
        unitCode: null,
        openingQuantity: 1,
        inwardQuantity: 4,
        outwardQuantity: 6,
        closingQuantity: -1,
        closingValue: -10,
      }),
    ])

    expect(totals.batchCount).toBe(2)
    expect(totals.opening).toBe(11)
    expect(totals.inward).toBe(9)
    expect(totals.outward).toBe(8)
    expect(totals.closing).toBe(12)
    expect(totals.closingValue).toBe(120)
    expect(totals.unit).toBe('KG')
  })
})

describe('groupBatches — dimension views', () => {
  it('groups batches by item, preserving report order inside each group', () => {
    const batches = [
      makeBatch({ itemId: 2, itemName: 'Item B', itemCode: 'ITEMB', batchNo: 'B1' }),
      makeBatch({ itemId: 1, itemName: 'Item A', itemCode: 'ITEMA', batchNo: 'B9' }),
      makeBatch({ itemId: 1, itemName: 'Item A', itemCode: 'ITEMA', batchNo: 'B3' }),
    ]

    const groups = groupBatches(batches, 'item-wise')

    expect(groups.map((g) => g.label)).toEqual(['Item B', 'Item A'])
    expect(groups[1].sublabel).toBe('ITEMA')
    expect(groups[1].batches.map((b) => b.batchNo)).toEqual(['B9', 'B3'])
    expect(groups[0].totals.batchCount).toBe(1)
  })

  it('groups by godown and falls back to the id when the godown is unnamed', () => {
    const groups = groupBatches(
      [
        makeBatch({ godownId: 3, godownName: null, godownCode: null }),
        makeBatch({ godownId: 1, godownName: 'Main Godown' }),
      ],
      'godown-wise',
    )

    expect(groups.map((g) => g.label)).toEqual([
      'Godown #3',
      'Main Godown',
    ])
  })

  it('puts every batch into exactly one expiry band', () => {
    const batches = [
      makeBatch({ batchNo: 'EXPIRED', expiryStatus: 'expired', daysToExpiry: -30 }),
      makeBatch({ batchNo: 'SOON', expiryStatus: 'expiring', daysToExpiry: 12 }),
      makeBatch({ batchNo: 'MID', expiryStatus: 'expiring', daysToExpiry: 75 }),
      makeBatch({ batchNo: 'HALFYEAR', expiryStatus: 'valid', daysToExpiry: 150 }),
      makeBatch({ batchNo: 'LATER', expiryStatus: 'valid', daysToExpiry: 900 }),
      makeBatch({ batchNo: 'NONE', expiryStatus: 'none' }),
    ]

    const groups = groupBatches(batches, 'expiry-wise', {
      expiryWithinDays: 90,
      ageingAsOnDate: '2026-03-31',
    })

    // One group per populated band, in band order, mutually exclusive.
    expect(groups.map((g) => g.key)).toEqual([
      'expiry-expired',
      'expiry-due30',
      'expiry-due90',
      'expiry-due180',
      'expiry-later',
      'expiry-none',
    ])
    const grouped = groups.flatMap((g) => g.batches.map((b) => b.batchNo))
    expect(grouped.sort()).toEqual(
      ['EXPIRED', 'SOON', 'MID', 'HALFYEAR', 'LATER', 'NONE'].sort(),
    )
    expect(groups[0].tone).toBe('danger')
    expect(groups[0].note).toContain('90 days')
    expect(groups[0].note).toContain('2026-03-31')
    // Empty bands are skipped entirely.
    expect(EXPIRY_BANDS).toHaveLength(6)
  })

  it('never hides a batch — anything a band cannot classify lands in a catch-all', () => {
    // 'expiring' without a day count matches no band on its own.
    const groups = groupBatches(
      [
        makeBatch({ batchNo: 'ODD', expiryStatus: 'expiring', daysToExpiry: null }),
        makeBatch({ batchNo: 'NORMAL', expiryStatus: 'none' }),
      ],
      'expiry-wise',
    )

    expect(groups.map((g) => g.key)).toEqual([
      'expiry-none',
      'expiry-unclassified',
    ])
    expect(groups[1].batches.map((b) => b.batchNo)).toEqual(['ODD'])
    expect(groups[1].tone).toBe('warning')
  })

  it('bands closing value, keeping negative values in their own band', () => {
    const groups = groupBatches(
      [
        makeBatch({ batchNo: 'NEG', closingValue: -50 }),
        makeBatch({ batchNo: 'NIL', closingValue: 0 }),
        makeBatch({ batchNo: 'LOW', closingValue: 9000 }),
        makeBatch({ batchNo: 'TOP', closingValue: 2500000 }),
      ],
      'value-wise',
    )

    expect(groups.map((g) => g.key)).toEqual([
      'value-negative',
      'value-nil',
      'value-low',
      'value-top',
    ])
    expect(groups[0].totals.closingValue).toBe(-50)
  })
})

describe('groupBatches — reconciliation view', () => {
  it('groups by issue, lets a batch appear in several issues and collects clean ones', () => {
    const batches = [
      makeBatch({
        batchNo: 'BAD',
        flags: {
          carryForwardOpening: true,
          journalVariance: false,
          negativeClosing: true,
          noMovement: false,
        },
      }),
      makeBatch({ batchNo: 'CARRY', flags: { carryForwardOpening: true, journalVariance: false, negativeClosing: false, noMovement: false } }),
      makeBatch({ batchNo: 'FINE', movementCount: 3, inwardQuantity: 5 }),
    ]

    const groups = groupBatches(batches, 'issue-wise')
    const byKey = Object.fromEntries(groups.map((g) => [g.key, g]))

    expect(groups.map((g) => g.key)).toEqual([
      'issue-negativeClosing',
      'issue-carryForwardOpening',
      'issue-clean',
    ])
    expect(byKey['issue-negativeClosing'].batches.map((b) => b.batchNo)).toEqual([
      'BAD',
    ])
    expect(
      byKey['issue-carryForwardOpening'].batches.map((b) => b.batchNo),
    ).toEqual(['BAD', 'CARRY'])
    expect(byKey['issue-clean'].batches.map((b) => b.batchNo)).toEqual(['FINE'])
    expect(byKey['issue-clean'].tone).toBe('success')
  })

  it('derives issues, severity and counts from the batch flags', () => {
    const bad = makeBatch({
      flags: {
        carryForwardOpening: true,
        journalVariance: true,
        negativeClosing: false,
        noMovement: false,
      },
    })
    const idle = makeBatch({
      flags: {
        carryForwardOpening: false,
        journalVariance: false,
        negativeClosing: false,
        noMovement: true,
      },
    })
    const clean = makeBatch({ movementCount: 2 })

    expect(issuesOf(bad)).toEqual(['carryForwardOpening', 'journalVariance'])
    expect(batchSeverity(bad)).toBe('warning')
    expect(
      batchSeverity(
        makeBatch({
          flags: {
            carryForwardOpening: false,
            journalVariance: false,
            negativeClosing: true,
            noMovement: false,
          },
        }),
      ),
    ).toBe('danger')
    expect(batchSeverity(clean)).toBe('neutral')

    expect(countByIssue([bad, idle, clean])).toEqual({
      negativeClosing: 0,
      carryForwardOpening: 1,
      journalVariance: 1,
      noMovement: 1,
      clean: 1,
    })
  })
})

describe('groupBatches — ageing, cohort, velocity, consumption, variance, unit', () => {
  it('places every batch in exactly one manufacturing-age band', () => {
    const batches = [
      makeBatch({ batchNo: 'FUTURE', daysSinceMfg: -3 }),
      makeBatch({ batchNo: 'FRESH', daysSinceMfg: 10 }),
      makeBatch({ batchNo: 'RECENT', daysSinceMfg: 60 }),
      makeBatch({ batchNo: 'MATURING', daysSinceMfg: 120 }),
      makeBatch({ batchNo: 'AGED', daysSinceMfg: 200 }),
      makeBatch({ batchNo: 'STALE', daysSinceMfg: 900 }),
      makeBatch({ batchNo: 'UNDATED', daysSinceMfg: null }),
    ]

    const groups = groupBatches(batches, 'ageing-wise', {
      ageingAsOnDate: '2026-03-31',
    })

    expect(groups.map((g) => g.key)).toEqual([
      'age-future',
      'age-fresh',
      'age-recent',
      'age-maturing',
      'age-aged',
      'age-stale',
      'age-unknown',
    ])
    expect(groups[0].note).toContain('2026-03-31')
    expect(groups[5].tone).toBe('danger')

    // Mutual exclusivity: no batch lands in two bands at once.
    const seen = groups.flatMap((g) => g.batches.map((b) => b.batchNo))
    expect(seen.sort()).toEqual(
      ['FUTURE', 'FRESH', 'RECENT', 'MATURING', 'AGED', 'STALE', 'UNDATED'].sort(),
    )
    expect(seen).toHaveLength(batches.length)
    expect(AGE_BANDS).toHaveLength(7)
  })

  it('bands movement volume without dropping the dormant batches', () => {
    const groups = groupBatches(
      [
        makeBatch({ batchNo: 'DORMANT', movementCount: 0 }),
        makeBatch({ batchNo: 'SLOW', movementCount: 2 }),
        makeBatch({ batchNo: 'STEADY', movementCount: 7 }),
        makeBatch({ batchNo: 'BUSY', movementCount: 15 }),
        makeBatch({ batchNo: 'HOT', movementCount: 40 }),
      ],
      'velocity-wise',
    )

    expect(groups.map((g) => g.key)).toEqual([
      'velocity-dormant',
      'velocity-slow',
      'velocity-steady',
      'velocity-busy',
      'velocity-hot',
    ])
    expect(groups[1].batches.map((b) => b.batchNo)).toEqual(['SLOW'])
    expect(VELOCITY_BANDS).toHaveLength(5)
  })

  it('classifies how much of each receipt has been issued out', () => {
    const groups = groupBatches(
      [
        makeBatch({
          batchNo: 'OVER',
          openingQuantity: 5,
          outwardQuantity: 12,
          closingQuantity: -7,
        }),
        makeBatch({
          batchNo: 'DONE',
          openingQuantity: 10,
          outwardQuantity: 10,
          closingQuantity: 0,
        }),
        makeBatch({
          batchNo: 'PARTLY',
          openingQuantity: 10,
          outwardQuantity: 4,
          closingQuantity: 6,
        }),
        makeBatch({
          batchNo: 'UNTOUCHED',
          openingQuantity: 10,
          closingQuantity: 10,
        }),
        makeBatch({
          batchNo: 'RECEIVED',
          inwardQuantity: 10,
          closingQuantity: 10,
        }),
        makeBatch({ batchNo: 'IDLE' }),
      ],
      'consumption-wise',
    )

    const byKey = Object.fromEntries(groups.map((g) => [g.key, g]))
    expect(groups.map((g) => g.key)).toEqual([
      'consumption-over-issued',
      'consumption-fully-issued',
      'consumption-partly-issued',
      'consumption-untouched',
      'consumption-received-only',
      'consumption-idle',
    ])
    expect(byKey['consumption-over-issued'].tone).toBe('danger')
    expect(byKey['consumption-over-issued'].batches.map((b) => b.batchNo)).toEqual(
      ['OVER'],
    )
    expect(
      byKey['consumption-partly-issued'].batches.map((b) => b.batchNo),
    ).toEqual(['PARTLY'])
    expect(CONSUMPTION_BANDS).toHaveLength(6)
  })

  it('measures opening drift against the opening-stock journal', () => {
    expect(
      isZeroQuantity(0.004, 2) && !isZeroQuantity(0.006, 2),
    ).toBe(true)

    const unvouched = makeBatch({ openingQuantity: 100, openingAsPerJournal: 0 })
    const matched = makeBatch({ openingQuantity: 100, openingAsPerJournal: 100 })
    const minor = makeBatch({ openingQuantity: 1005, openingAsPerJournal: 1000 })
    const moderate = makeBatch({
      openingQuantity: 1030,
      openingAsPerJournal: 1000,
    })
    const material = makeBatch({
      openingQuantity: 1200,
      openingAsPerJournal: 1000,
    })

    expect(openingVariance(material)).toBe(200)
    expect(openingVarianceRatio(unvouched)).toBeNull()
    expect(openingVarianceRatio(minor)).toBeCloseTo(0.005, 6)
    expect(hasOpeningVariance(matched)).toBe(false)
    expect(hasOpeningVariance(unvouched)).toBe(true)

    const groups = groupBatches(
      [unvouched, matched, minor, moderate, material],
      'variance-wise',
    )

    expect(groups.map((g) => g.key)).toEqual([
      'variance-unvouched',
      'variance-matched',
      'variance-minor',
      'variance-moderate',
      'variance-material',
    ])
    expect(groups[4].tone).toBe('danger')
    // Bands stay mutually exclusive — five batches, five groups, one each.
    expect(groups.map((g) => g.totals.batchCount)).toEqual([1, 1, 1, 1, 1])
    expect(VARIANCE_BANDS).toHaveLength(5)
  })

  it('groups manufacturing cohorts newest first and keeps undated batches last', () => {
    expect(mfgCohortKey('2026-03-04')).toBe('2026-03')
    expect(mfgCohortKey('nonsense')).toBeNull()
    expect(mfgCohortKey('2026-13-01')).toBeNull()
    expect(mfgCohortKey(null)).toBeNull()
    expect(mfgCohortLabel('2026-03')).toBe('Mar 2026')

    const groups = groupBatches(
      [
        makeBatch({ batchNo: 'JAN', mfgDate: '2026-01-09' }),
        makeBatch({ batchNo: 'DEC', mfgDate: '2025-12-31' }),
        makeBatch({ batchNo: 'FEB', mfgDate: '2026-02-01' }),
        makeBatch({ batchNo: 'NODATE', mfgDate: null }),
      ],
      'mfg-cohort-wise',
    )

    expect(groups.map((g) => g.key)).toEqual([
      'mfg-2026-02',
      'mfg-2026-01',
      'mfg-2025-12',
      'mfg-none',
    ])
    expect(groups.map((g) => g.label)).toEqual([
      'Feb 2026',
      'Jan 2026',
      'Dec 2025',
      'No mfg date',
    ])
    expect(groups[3].tone).toBe('warning')
  })

  it('splits units apart because their quantities are not comparable', () => {
    const groups = groupBatches(
      [
        makeBatch({ batchNo: 'KILO', unitCode: 'KG' }),
        makeBatch({ batchNo: 'PIECE', unitCode: 'NOS' }),
        makeBatch({ batchNo: 'NONE', unitCode: null }),
      ],
      'unit-wise',
    )

    expect(groups.map((g) => g.key)).toEqual(['unit-KG', 'unit-NOS', 'unit-none'])
    expect(groups[0].note).toContain('must not be added together')
    expect(groups[2].tone).toBe('warning')
  })
})

describe('buildRanked', () => {
  const batches = [
    makeBatch({ batchNo: 'MID', closingValue: 100, closingQuantity: 5 }),
    makeBatch({ batchNo: 'TOP', closingValue: 300, closingQuantity: 1 }),
    makeBatch({ batchNo: 'TIE', closingValue: 100, closingQuantity: 9 }),
    makeBatch({ batchNo: 'NIL', closingValue: 0, closingQuantity: 0 }),
  ]

  it('ranks by closing value with shares and a running cumulative share', () => {
    const table = buildRanked(batches, 'value')

    expect(table.total).toBe(500)
    expect(table.rows.map((r) => r.rank)).toEqual([1, 2, 3, 4])
    expect(table.rows.map((r) => r.batch.batchNo)).toEqual([
      'TOP',
      'MID',
      'TIE',
      'NIL',
    ])
    expect(table.rows[0].share).toBeCloseTo(0.6, 6)
    // Equal metrics keep their report order (stable sort) and split the share.
    expect(table.rows[1].share).toBeCloseTo(0.2, 6)
    expect(table.rows[2].share).toBeCloseTo(0.2, 6)
    expect(table.rows.map((r) => r.cumulativeShare)).toEqual([
      expect.closeTo(0.6, 6),
      expect.closeTo(0.8, 6),
      expect.closeTo(1, 6),
      expect.closeTo(1, 6),
    ])
    expect(table.nilCount).toBe(1)
    expect(table.negativeCount).toBe(0)
  })

  it('ranks by quantity and flags negative and nil rows', () => {
    const table = buildRanked(
      [
        ...batches,
        makeBatch({ batchNo: 'NEG', closingValue: -50, closingQuantity: -2 }),
      ],
      'quantity',
    )

    expect(table.rows[0].batch.batchNo).toBe('TIE')
    expect(table.rows.at(-1)?.batch.batchNo).toBe('NEG')
    expect(table.negativeCount).toBe(1)
    // Negative rows pull the total down, so the shares stay real shares.
    expect(table.total).toBe(13)
  })

  it('returns zero shares instead of dividing by a nil total', () => {
    const table = buildRanked([makeBatch({ closingValue: 0 })])
    expect(table.total).toBe(0)
    expect(table.rows[0].share).toBe(0)
  })
})

describe('buildPivot', () => {
  it('pivots closing balances by item and godown, totalling value only', () => {
    const table = buildPivot([
      makeBatch({
        batchNo: 'A1',
        itemId: 1,
        itemName: 'Rice',
        itemCode: 'R1',
        godownId: 1,
        godownName: 'Main',
        unitCode: 'KG',
        noOfDecimalPlaces: 3,
        closingQuantity: 10,
        closingValue: 1000,
      }),
      makeBatch({
        batchNo: 'A2',
        itemId: 1,
        itemName: 'Rice',
        itemCode: 'R1',
        godownId: 1,
        godownName: 'Main',
        unitCode: 'KG',
        closingQuantity: 5,
        closingValue: 500,
      }),
      makeBatch({
        batchNo: 'B1',
        itemId: 2,
        itemName: 'Bolt',
        itemCode: 'B1',
        godownId: 2,
        godownName: 'Annexe',
        unitCode: 'NOS',
        closingQuantity: 7,
        closingValue: 70,
      }),
    ])

    expect(table.columns.map((c) => c.label)).toEqual(['Main', 'Annexe'])
    expect(table.rows.map((r) => r.itemName)).toEqual(['Rice', 'Bolt'])
    expect(table.batchCount).toBe(3)

    const rice = table.rows[0]
    expect(rice.cells[0]?.quantity).toBe(15)
    expect(rice.cells[0]?.value).toBe(1500)
    expect(rice.cells[0]?.batchCount).toBe(2)
    expect(rice.cells[0]?.batchNos).toEqual(['A1', 'A2'])
    // The cell opens the biggest batch behind it.
    expect(rice.cells[0]?.primary.batchNo).toBe('A1')
    // Empty cells stay null rather than a 0 that looks like stock.
    expect(rice.cells[1]).toBeNull()
    expect(table.rows[1].cells[0]).toBeNull()

    expect(rice.quantity).toBe(15)
    expect(rice.value).toBe(1500)
    expect(rice.noOfDecimalPlaces).toBe(3)
    expect(table.columnValues).toEqual([1500, 70])
    expect(table.columnBatchCounts).toEqual([2, 1])
    expect(table.totalValue).toBe(1570)
  })

  it('returns an empty matrix for no batches', () => {
    const table = buildPivot([])
    expect(table.columns).toEqual([])
    expect(table.rows).toEqual([])
    expect(table.totalValue).toBe(0)
    expect(table.batchCount).toBe(0)
  })
})

describe('groupByVoucherType', () => {
  it('aggregates in/out quantity and value per voucher type from the trail', () => {
    const batch = makeBatch({
      batchNo: 'B1',
      openingMovements: [
        {
          voucherId: 9,
          voucherNo: 'OPNS-1',
          voucherDate: '2025-04-01',
          voucherTypeName: 'Opening Stock',
          movementType: 'in',
          quantity: 100,
          rate: 10,
          amount: 1000,
          remarks: null,
          kind: 'journal',
          balanceAfter: 100,
        },
      ],
      movements: [
        movement({ voucherTypeName: 'Purchase', movementType: 'in', quantity: 20, amount: 240 }),
        movement({ voucherTypeName: 'Sales', movementType: 'out', quantity: 5, amount: 60 }),
        movement({ voucherTypeName: null, movementType: 'out', quantity: 1, amount: 12 }),
      ],
    })

    const groups = groupByVoucherType([batch, makeBatch({ batchNo: 'B2' })])
    const byLabel = Object.fromEntries(groups.map((g) => [g.label, g]))

    expect(groups.map((g) => g.label)).toEqual([
      'Opening Stock',
      'Purchase',
      'Sales',
      'Unclassified',
    ])
    expect(byLabel['Opening Stock'].inward).toBe(100)
    expect(byLabel['Opening Stock'].inwardValue).toBe(1000)
    expect(byLabel['Purchase'].inward).toBe(20)
    expect(byLabel['Purchase'].outward).toBe(0)
    expect(byLabel['Sales'].outward).toBe(5)
    expect(byLabel['Sales'].outwardValue).toBe(60)
    expect(byLabel['Unclassified'].outward).toBe(1)
    // Each voucher type lists the batches it touched, once each.
    expect(byLabel['Purchase'].batches.map((b) => b.batchNo)).toEqual(['B1'])
  })

  it('breaks each voucher type down into per-batch rows carrying batch no and godown', () => {
    const batchA = makeBatch({
      itemId: 1,
      itemName: 'Item A',
      batchNo: 'B1',
      godownId: 1,
      godownName: 'Main Godown',
      movements: [
        movement({ voucherTypeName: 'Purchase', movementType: 'in', quantity: 20, amount: 240 }),
        movement({ voucherTypeName: 'Sales', movementType: 'out', quantity: 5, amount: 60 }),
      ],
    })
    const batchB = makeBatch({
      itemId: 2,
      itemName: 'Item B',
      batchNo: 'B2',
      godownId: 7,
      godownName: null,
      movements: [
        movement({ voucherTypeName: 'Purchase', movementType: 'in', quantity: 4, amount: 48 }),
        movement({ voucherTypeName: 'Purchase', movementType: 'in', quantity: 6, amount: 72 }),
      ],
    })

    const byLabel = Object.fromEntries(
      groupByVoucherType([batchA, batchB]).map((g) => [g.label, g]),
    )

    // One row per batch, in report order, with its own line count.
    expect(byLabel['Purchase'].rows.map((r) => r.batchNo)).toEqual(['B1', 'B2'])
    expect(byLabel['Purchase'].rows.map((r) => r.godownName)).toEqual([
      'Main Godown',
      null,
    ])
    expect(byLabel['Purchase'].rows.map((r) => r.lineCount)).toEqual([1, 2])
    expect(byLabel['Purchase'].rows.map((r) => r.batch)).toEqual([
      batchA,
      batchB,
    ])

    // A batch's lines aggregate into a single row (B2 booked twice).
    const second = byLabel['Purchase'].rows[1]
    expect(second.inward).toBe(10)
    expect(second.inwardValue).toBe(120)
    expect(second.godownId).toBe(7)

    // Rows reconcile with the group's own totals.
    const purchase = byLabel['Purchase']
    expect(purchase.rows.reduce((sum, r) => sum + r.inward, 0)).toBe(
      purchase.inward,
    )
    expect(purchase.rows.reduce((sum, r) => sum + r.inwardValue, 0)).toBe(
      purchase.inwardValue,
    )
    expect(purchase.rows.reduce((sum, r) => sum + r.lineCount, 0)).toBe(
      purchase.movementCount,
    )

    // Out-only voucher types still get their row.
    expect(byLabel['Sales'].rows.map((r) => r.batchNo)).toEqual(['B1'])
    expect(byLabel['Sales'].rows[0].outward).toBe(5)
    expect(byLabel['Sales'].rows[0].inward).toBe(0)
  })

  it('returns nothing for batches without any trail', () => {
    expect(groupByVoucherType([makeBatch()])).toEqual([])
  })
})
