import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeliveryNoteSummaryDialogById } from './voucher-no-summary-dialog'
import { useVoucherDispatchDetailMutation } from '../../freight/data/queryOptions'
import { columns } from '../../freight/components/columns'
import { resolveDispatchWeight } from '../../shared/dispatch-defaults'
import type { VoucherSchema } from '../../data-schema/voucher-schema'

// ── Router: partial mock — the dialog's import chain pulls in the Day Book
// route file (via deliveryNoteQueryOptions), which needs the real
// createFileRoute; only useNavigate is stubbed. ─────────────────────────────
vi.mock(import('@tanstack/react-router'), async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

// ── HTTP layer: two delivery notes — DLNT-917 has NO saved weight (the
// calculated 18.5 MT from its stock journal renders marked "estimated"),
// DLNT-200 has a saved 15 MT weight (no badge). The dispatch-detail save
// endpoints flip DLNT-917's stored weight, so the refetch triggered by the
// mutation's cache invalidation returns saved data. ──────────────────────────
const makeVoucher = (
  overrides: Record<string, unknown>,
): Record<string, unknown> => ({
  voucherNo: 'DLNT-917',
  voucherDate: '2026-09-01T00:00:00.000000Z',
  voucherTypeId: 2001,
  voucherEntries: [],
  remarks: null,
  ...overrides,
})

const weightUnit = { id: 16, code: 'MT', noOfDecimalPlaces: 2 }

const unsavedWeightVoucher = makeVoucher({
  id: 917,
  voucherDispatchDetail: {
    id: 500,
    voucherId: 917,
    weight: null,
    weightUnitId: 16,
    weightUnit,
    freightBasis: 'weight',
  },
  stockJournal: {
    stockJournalEntries: [
      {
        actualQuantity: '12.5',
        stockUnit: { code: 'MT', noOfDecimalPlaces: 2 },
      },
      {
        actualQuantity: '6',
        stockUnit: { code: 'MT', noOfDecimalPlaces: 2 },
      },
    ],
  },
})

const savedWeightVoucher = makeVoucher({
  id: 200,
  voucherNo: 'DLNT-200',
  voucherDispatchDetail: {
    id: 600,
    voucherId: 200,
    weight: '15',
    weightUnitId: 16,
    weightUnit,
    freightBasis: 'weight',
  },
  stockJournal: {
    stockJournalEntries: [{ actualQuantity: '20' }],
  },
})

// What the "backend" currently has stored for each voucher's dispatch detail.
const storedDispatchWeights: Record<number, string | null> = {
  917: null,
  200: '15',
}

const envelope = (voucher: Record<string, unknown>) => ({
  data: voucher,
  success: true,
  code: 200,
  message: 'ok',
})

vi.mock('@/utils/dataClient', () => ({
  getData: vi.fn((url: string) => {
    if (url === '/vouchers/917') {
      return Promise.resolve(
        envelope({
          ...unsavedWeightVoucher,
          voucherDispatchDetail: {
            ...(unsavedWeightVoucher.voucherDispatchDetail as object),
            weight: storedDispatchWeights[917],
          },
        }) as Record<string, unknown>,
      )
    }
    if (url === '/vouchers/200') {
      return Promise.resolve(envelope(savedWeightVoucher))
    }
    // Lists the dispatch editor's selectors suspend on.
    if (url === '/stock_units') {
      return Promise.resolve({
        data: [
          {
            id: 16,
            code: 'MT',
            unitType: 'simple',
            quantityType: 'weight',
            noOfDecimalPlaces: 2,
          },
          {
            id: 10,
            code: 'M3',
            unitType: 'simple',
            quantityType: 'volume',
            noOfDecimalPlaces: 2,
          },
        ],
        success: true,
        code: 200,
        message: 'ok',
      })
    }
    if (url === '/transporters' || url === '/delivery_vehicles') {
      return Promise.resolve({
        data: [],
        success: true,
        code: 200,
        message: 'ok',
      })
    }
    return Promise.reject(new Error(`Unexpected GET ${url}`))
  }),
  postData: vi.fn((url: string) => {
    if (url === '/voucher_dispatch_details') {
      storedDispatchWeights[917] = '18.5'
      return Promise.resolve({ success: true, code: 200, message: 'ok' })
    }
    return Promise.reject(new Error(`Unexpected POST ${url}`))
  }),
  putData: vi.fn((url: string) => {
    if (url === '/voucher_dispatch_details/500') {
      storedDispatchWeights[917] = '18.5'
      return Promise.resolve({ success: true, code: 200, message: 'ok' })
    }
    return Promise.reject(new Error(`Unexpected PUT ${url}`))
  }),
}))

// ── Helpers ─────────────────────────────────────────────────────────────────
const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

/**
 * The Weight row renders "18.50 MT" in two places (dispatch card + Total Qty
 * row sums to the same figure), so assertions go through the estimated badge:
 * the row containing the badge must be the Weight row and carry the weight.
 */
const expectWeightRow = (weightLabel: string) => {
  const badge = screen.getByText('estimated')
  const row = badge.closest('div')
  expect(row?.textContent).toContain('Weight')
  expect(row?.textContent).toContain(weightLabel)
}

const renderDialog = (voucherId: number, voucherNo: string) => {
  const client = makeClient()
  const utils = render(
    createElement(
      QueryClientProvider,
      { client },
      createElement(DeliveryNoteSummaryDialogById, { voucherId, voucherNo }),
    ),
  )
  return { client, ...utils }
}

const openDialog = async (voucherId: number, voucherNo: string) => {
  const utils = renderDialog(voucherId, voucherNo)
  fireEvent.click(await screen.findByText(voucherNo))
  return utils
}

/** Saves through the REAL mutation so the invalidation contract is exercised. */
const MutationButton = ({ payload }: { payload: Record<string, unknown> }) => {
  const { mutate } = useVoucherDispatchDetailMutation()
  return (
    <button type="button" onClick={() => mutate(payload as never)}>
      simulate-save
    </button>
  )
}

const renderGridCell = (voucher: VoucherSchema) => {
  const weightColumn = columns.find((col) => col.id === 'weight')!
  const cell = weightColumn.cell as (ctx: {
    row: { original: VoucherSchema }
  }) => React.ReactNode
  return render(
    createElement(
      'table',
      null,
      createElement(
        'tbody',
        null,
        createElement('tr', null, cell({ row: { original: voucher } })),
      ),
    ),
  )
}

beforeEach(() => {
  storedDispatchWeights[917] = null
})

describe('Estimated weight hint — delivery note summary dialog', () => {
  it('shows the calculated weight with an estimated badge when no weight is saved', async () => {
    await openDialog(917, 'DLNT-917')

    await screen.findByText('estimated')
    expectWeightRow('18.50 MT')
  })

  it('shows the saved weight without the badge', async () => {
    await openDialog(200, 'DLNT-200')

    expect(await screen.findByText('15.00 MT')).toBeTruthy()
    expect(screen.queryByText('estimated')).toBeNull()
  })

  it('clears the badge after the dispatch details are saved', async () => {
    const client = makeClient()
    render(
      createElement(
        QueryClientProvider,
        { client },
        createElement(DeliveryNoteSummaryDialogById, {
          voucherId: 917,
          voucherNo: 'DLNT-917',
        }),
        createElement(MutationButton, {
          payload: { id: 500, voucherId: '917', weight: 18.5 },
        }),
      ),
    )
    fireEvent.click(await screen.findByText('DLNT-917'))
    await screen.findByText('estimated')

    fireEvent.click(screen.getByText('simulate-save'))

    // The mutation invalidates ['deliveryNote'] → refetch returns the saved
    // weight → the card re-renders without the estimated badge.
    await waitFor(() => {
      expect(screen.queryByText('estimated')).toBeNull()
    })
    // 18.50 MT now appears as the saved weight (weight row + total qty row).
    expect(screen.getAllByText('18.50 MT').length).toBeGreaterThan(0)
  })
})

describe('Estimated weight hint — freight grid Weight column', () => {
  it('renders the calculated weight with the badge for rows without a saved weight', () => {
    renderGridCell(unsavedWeightVoucher as unknown as VoucherSchema)

    expect(screen.getByText('18.50')).toBeTruthy()
    expect(screen.getByText('estimated')).toBeTruthy()
  })

  it('renders the saved weight without the badge', () => {
    renderGridCell(savedWeightVoucher as unknown as VoucherSchema)

    expect(screen.getByText('15.00')).toBeTruthy()
    expect(screen.queryByText('estimated')).toBeNull()
  })

  it("falls back to '-' when there is neither a saved nor a calculated weight", () => {
    const empty = makeVoucher({
      id: 300,
      voucherNo: 'DLNT-300',
      voucherDispatchDetail: { id: 700, voucherId: 300, weight: null },
      stockJournal: { stockJournalEntries: [] },
    })

    renderGridCell(empty as unknown as VoucherSchema)

    expect(screen.getByText('-')).toBeTruthy()
    expect(screen.queryByText('estimated')).toBeNull()
  })
})

describe('resolveDispatchWeight (shared defaulting used by both surfaces)', () => {
  it('saved weight wins over the calculated one', () => {
    expect(
      resolveDispatchWeight({
        voucherDispatchDetail: { weight: 15 },
        stockJournal: { stockJournalEntries: [{ actualQuantity: 20 }] },
      }),
    ).toBe(15)
  })
})
