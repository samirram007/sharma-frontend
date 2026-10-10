import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LifelineTimeline } from './lifeline-timeline'
import type { LifelineRow, LifelineYear } from './data/schema'

function makeRow(overrides: Partial<LifelineRow> = {}): LifelineRow {
  return {
    key: 'row-1',
    bucketKey: 'item-1-godown-1',
    itemId: 1,
    itemName: 'Item A',
    itemCode: 'ITEMA',
    unitCode: 'MT',
    noOfDecimalPlaces: 2,
    godownId: 1,
    godownName: 'Rail Head Adina',
    godownCode: 'RHA',
    batchNo: '15.07.2026',
    mfgDate: null,
    expiryDate: null,
    serialNo: null,
    remarks: null,
    voucherId: 1,
    voucherNo: 'DLNT-5551',
    voucherDate: '2026-07-14',
    voucherTypeId: 1,
    voucherTypeName: 'Delivery Note',
    journalType: null,
    kind: 'movement',
    movementType: 'out',
    quantity: 4,
    rate: 4000,
    amount: 16000,
    signedQuantity: -4,
    signedAmount: -16000,
    applied: true,
    restatesOpening: false,
    runningBalance: 7,
    runningValue: 28000,
    fiscalYearId: 1,
    fiscalYearName: 'FY 2026-27',
    yearKey: '1',
    transfer: false,
    transferPeerGodownId: null,
    transferPeerGodownName: null,
    ...overrides,
  }
}

const year: LifelineYear = {
  key: '1',
  fiscalYearId: 1,
  name: 'FY 2026-27',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
  rowCount: 1,
  movementCount: 1,
  carriedIn: 11,
  carriedInValue: 44000,
  carriedOut: 7,
  carriedOutValue: 28000,
  inQuantity: 0,
  outQuantity: 4,
  inValue: 0,
  outValue: 16000,
  openingQuantity: 11,
  openingRestated: false,
  hasMixedUnits: false,
  buckets: [],
}

describe('LifelineTimeline batch / godown columns', () => {
  it('shows the batch no and godown on every line, without the item column by default', () => {
    render(<LifelineTimeline rows={[makeRow()]} years={[year]} />)

    expect(screen.getByRole('columnheader', { name: 'Batch no' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'Godown' })).toBeTruthy()
    expect(screen.queryByRole('columnheader', { name: 'Item' })).toBeNull()

    expect(screen.getByText('15.07.2026')).toBeTruthy()
    expect(screen.getByText('Rail Head Adina')).toBeTruthy()

    // The year divider spans all 12 columns of the default layout.
    const marker = screen.getByText('FY 2026-27').closest('td')
    expect(marker?.getAttribute('colspan')).toBe('12')
  })

  it('adds the item column and widens the year divider when buckets share a batch', () => {
    render(
      <LifelineTimeline
        rows={[makeRow({ godownName: null, godownId: 42 })]}
        years={[year]}
        showItem
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'Item' })).toBeTruthy()
    expect(screen.getByText('Item A')).toBeTruthy()
    // Godown is still there, falling back to the id.
    expect(screen.getByText('Godown #42')).toBeTruthy()

    const marker = screen.getByText('FY 2026-27').closest('td')
    expect(marker?.getAttribute('colspan')).toBe('13')
  })

  it('keeps the ten columns of the compact inspector layout spanned correctly', () => {
    render(<LifelineTimeline rows={[makeRow()]} years={[year]} compact />)

    expect(screen.queryByRole('columnheader', { name: 'Serial' })).toBeNull()
    expect(screen.queryByRole('columnheader', { name: 'Remarks' })).toBeNull()

    const marker = screen.getByText('FY 2026-27').closest('td')
    expect(marker?.getAttribute('colspan')).toBe('10')
  })
})
