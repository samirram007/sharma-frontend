import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RunningBalanceDetailView from './running-balance-detail'
import type { RunningBalanceDetail } from '../data/schema'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

const godownBase = {
  godownId: 1,
  godownName: 'Main Godown',
  inwardQuantity: 0,
  outwardQuantity: 5,
  netQuantity: -5,
}

const makeDetail = (
  godownDetails: NonNullable<
    RunningBalanceDetail['transactions'][number]['godownDetails']
  >,
): RunningBalanceDetail => ({
  item: {
    itemId: 1,
    itemName: 'Steel Rod',
    unitCode: 'MT',
    unitName: 'Metric Ton',
    noOfDecimalPlaces: 2,
  },
  openingQuantity: 0,
  totalInward: 0,
  totalOutward: 5,
  closingQuantity: -5,
  transactions: [
    {
      voucherId: 101,
      voucherType: 'Delivery Note',
      voucherNo: 'DLNT-100',
      voucherDate: '2026-08-09',
      inwardQuantity: 0,
      outwardQuantity: 5,
      runningBalance: -5,
      isOpening: false,
      godownDetails,
    },
  ],
})

describe('RunningBalanceDetailView godown lines', () => {
  it('renders no godown detail rows when detailLines is undefined', () => {
    render(
      <RunningBalanceDetailView
        data={makeDetail([{ ...godownBase, detailLines: undefined }])}
        onBack={vi.fn()}
      />,
    )

    // The godown name only appears inside the expandable godown-details row,
    // which is skipped when there are no detailLines to show.
    expect(screen.queryByText('Main Godown')).toBeNull()
    expect(screen.queryByText(/Batch:/)).toBeNull()
    expect(screen.queryByText(/Serial:/)).toBeNull()
  })

  it('renders godown batch/serial detail lines when detailLines is present', () => {
    render(
      <RunningBalanceDetailView
        data={makeDetail([
          {
            ...godownBase,
            detailLines: [
              {
                batchNo: 'B-101',
                serialNo: 'S-7',
                mfgDate: null,
                expiryDate: null,
                movementType: 'out',
                quantity: 5,
                rate: 100,
                amount: 500,
                remarks: null,
              },
            ],
          },
        ])}
        onBack={vi.fn()}
      />,
    )

    expect(screen.getByText('Main Godown')).toBeTruthy()
    expect(screen.getByText('B-101')).toBeTruthy()
    expect(screen.getByText('S-7')).toBeTruthy()
    expect(screen.getByText('OUT')).toBeTruthy()
  })
})
