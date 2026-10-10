import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BatchMovementTable } from './batch-movement-table'
import type { BatchBalance } from './data/schema'

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

const movement = {
  voucherId: 1,
  voucherNo: 'V-1',
  voucherDate: '2025-06-15',
  voucherTypeName: 'Sales',
  movementType: 'out',
  quantity: 5,
  rate: 10,
  amount: 50,
  remarks: null,
  runningBalance: 5,
}

describe('BatchMovementTable batch / godown columns', () => {
  it('repeats the batch no and godown on the opening, movement and closing rows', () => {
    const batch = makeBatch({
      batchNo: 'B-99',
      godownName: 'Rail Head Adina',
      openingQuantity: 10,
      openingValue: 100,
      outwardQuantity: 5,
      outwardValue: 50,
      closingQuantity: 5,
      closingValue: 50,
      movementCount: 1,
      movements: [movement],
    })

    render(<BatchMovementTable batch={batch} openingAsOnDate="2026-04-01" />)

    expect(screen.getByRole('columnheader', { name: 'Batch no' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'Godown' })).toBeTruthy()

    // Opening row + movement row both carry the batch identity; the closing
    // row spans the leading columns (label + batch/godown/date/voucher/type).
    expect(screen.getAllByText('B-99')).toHaveLength(2)
    expect(screen.getAllByText('Rail Head Adina')).toHaveLength(2)
    expect(screen.getByText('Closing balance').getAttribute('colspan')).toBe(
      '5',
    )

    // The trail itself is untouched: dates, voucher and running balance.
    expect(screen.getAllByText('15 Jun 2025')).toHaveLength(1)
    expect(screen.getByText('V-1')).toBeTruthy()
    // The movement row and the closing total both show the issued quantity.
    expect(screen.getAllByText('-5.00 KG')).toHaveLength(2)
  })

  it('falls back to the godown id when the name is missing', () => {
    const batch = makeBatch({
      batchNo: 'B-7',
      godownId: 42,
      godownName: null,
      openingQuantity: 3,
      openingValue: 30,
    })

    render(<BatchMovementTable batch={batch} />)

    expect(screen.getAllByText('Godown #42').length).toBeGreaterThan(0)
    expect(screen.getAllByText('B-7').length).toBeGreaterThan(0)
  })

  it('hides the serial column when no row carries a serial number', () => {
    const batch = makeBatch({ movements: [movement] })

    render(<BatchMovementTable batch={batch} />)

    expect(screen.queryByRole('columnheader', { name: 'Serial' })).toBeNull()
  })
})
