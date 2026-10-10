import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { BatchVoucherTypes } from './batch-voucher-types'
import { groupByVoucherType } from './views'
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

const purchaseBatch = makeBatch({
  movements: [
    movement({ movementType: 'in', quantity: 20, amount: 240 }),
    movement({ movementType: 'out', quantity: 5, amount: 60 }),
  ],
})

describe('BatchVoucherTypes table', () => {
  it('shows Batch no and Godown columns and opens the inspector on row click', () => {
    const onInspect = vi.fn()
    const contributions = groupByVoucherType([purchaseBatch])

    render(
      <BatchVoucherTypes contributions={contributions} onInspect={onInspect} />,
    )

    // The requested columns are on the table header.
    expect(screen.getByText('Batch no')).toBeTruthy()
    expect(screen.getByText('Godown')).toBeTruthy()

    // …and the row carries the batch's own values.
    expect(screen.getByText('B1')).toBeTruthy()
    expect(screen.getByText('Main Godown')).toBeTruthy()
    expect(screen.getByText('Item A')).toBeTruthy()

    fireEvent.click(screen.getByText('B1'))
    expect(onInspect).toHaveBeenCalledWith(purchaseBatch)
  })

  it('falls back to the godown id and keeps the voucher type name', () => {
    const orphan = makeBatch({
      batchNo: 'B9',
      godownId: 7,
      godownName: null,
      movements: [
        movement({
          voucherTypeName: null,
          movementType: 'out',
          quantity: 3,
          amount: 30,
        }),
      ],
    })

    render(
      <BatchVoucherTypes
        contributions={groupByVoucherType([orphan])}
        onInspect={vi.fn()}
      />,
    )

    expect(screen.getByText('B9')).toBeTruthy()
    expect(screen.getByText('Godown #7')).toBeTruthy()
    expect(screen.getByText('Unclassified')).toBeTruthy()
  })

  it('renders the empty state when no voucher type has a trail', () => {
    render(
      <BatchVoucherTypes
        contributions={groupByVoucherType([makeBatch()])}
        onInspect={vi.fn()}
      />,
    )

    expect(screen.getByText(/No movement trail on this page/)).toBeTruthy()
  })
})
