import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import OpeningStockSummaryCard from './opening-stock-summary-card'

// ── Router: stub Link so deep links can be asserted without a real router ──
const linkClicks: string[] = []
vi.mock('@tanstack/react-router', () => ({
  Link: (props: {
    to: string
    params?: { id?: string }
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <a
      href={props.to}
      data-testid="opnsk-link"
      data-id={props.params?.id}
      onClick={() => linkClicks.push(props.to)}
    >
      {props.children}
    </a>
  ),
}))

// ── Auth: logged-in user on fiscal year 2 (matches the seeded voucher) ─────
const authState = { fiscalYearId: 2 }
vi.mock('@/features/auth/contexts/AuthContext', () => ({
  useAuth: () => ({
    userFiscalYear: {
      fiscalYearId: authState.fiscalYearId,
      fiscalYear: { startDate: '2026-04-01', endDate: '2027-03-31' },
    },
  }),
}))

// ── HTTP layer: mirrors the REAL payloads returned by the dev API for the
// OPNSK voucher 6741 (OPNS-1) and stock item 1003 (95.80 across 4 godowns,
// batch 010426). Only getData is intercepted; other verbs are unused here. ──
const voucherTypeEnvelope = {
  data: { id: 9010, code: 'OPNSK', name: 'Opening Stock' },
  success: true,
  code: 200,
  message: 'ok',
}

const listItem = {
  id: 6741,
  voucherNo: 'OPNS-1',
  voucherDate: '2026-04-01T00:00:00.000000Z',
  voucherTypeId: 9010,
  fiscalYearId: 2,
  stockJournalId: 6697,
}

const godownEntry = (over: Record<string, unknown>) => ({
  id: null,
  stockJournalEntryId: null,
  godownId: 0,
  batchNo: '010426',
  mfgDate: null,
  expiryDate: null,
  serialNo: null,
  actualQuantity: 0,
  billingQuantity: 0,
  rate: 5623.63,
  amount: 0,
  movementType: 'in',
  remarks: null,
  godown: null,
  stockItem: null,
  stockUnit: null,
  rateUnit: null,
  ...over,
})

const item1003Entry = {
  id: 1,
  stockJournalId: 6697,
  stockItemId: 1003,
  stockUnitId: 16,
  alternateStockUnitId: null,
  unitRatio: 0,
  itemCost: 0,
  actualQuantity: 95.8,
  billingQuantity: 95.8,
  rate: 5623.63,
  rateUnitId: 16,
  rateUnitRatio: 1,
  discountPercentage: 0,
  discount: 0,
  amount: 538743.74,
  movementType: 'in',
  stockItem: null,
  stockUnit: null,
  rateUnit: null,
  alternateStockUnit: null,
  stockJournalGodownEntries: [
    godownEntry({
      godownId: 21,
      actualQuantity: 7.15,
      billingQuantity: 7.15,
      amount: 40209.0545,
      godown: { id: 21, name: 'SANDIP GOYAL', code: 'SG', status: 'active' },
    }),
    godownEntry({
      godownId: 13,
      actualQuantity: 0.45,
      billingQuantity: 0.45,
      amount: 2530.6335,
      godown: { id: 13, name: 'ASHISH GHOSH', code: 'AG', status: 'active' },
    }),
    godownEntry({
      godownId: 2,
      actualQuantity: 40.75,
      billingQuantity: 40.75,
      amount: 229162.9225,
      godown: { id: 2, name: 'POKHRAJ1', code: 'PK1', status: 'active' },
    }),
    godownEntry({
      godownId: 6,
      actualQuantity: 47.45,
      billingQuantity: 47.45,
      amount: 266841.1296,
      godown: { id: 6, name: 'GOYANKHA GODWON', code: 'GG', status: 'active' },
    }),
  ],
}

// Another item's entry — must NOT leak into item 1003's card.
const otherItemEntry = {
  ...item1003Entry,
  id: 2,
  stockItemId: 2001,
  actualQuantity: 999,
  billingQuantity: 999,
  amount: 999,
  stockJournalGodownEntries: [
    godownEntry({
      godownId: 2,
      actualQuantity: 999,
      godown: { id: 2, name: 'POKHRAJ1', code: 'PK1', status: 'active' },
    }),
  ],
}

const voucherDetailEnvelope = {
  data: {
    id: 6741,
    voucherNo: 'OPNS-1',
    voucherDate: '2026-04-01T00:00:00.000000Z',
    voucherTypeId: 9010,
    fiscalYearId: 2,
    module: 'opening_stock',
    stockJournalId: 6697,
    stockJournal: {
      id: 6697,
      journalNo: 'OPNS-1',
      journalDate: '2026-04-01T00:00:00.000000Z',
      voucherId: 6741,
      type: 'OPNSK',
      remarks: null,
      stockJournalEntries: [item1003Entry, otherItemEntry],
    },
    voucherEntries: [],
  },
  success: true,
  code: 200,
  message: 'ok',
}

vi.mock('@/utils/dataClient', () => ({
  getData: vi.fn((url: string) => {
    if (url.includes('opening-stock/voucher-type')) return voucherTypeEnvelope
    if (url.includes('voucherTypeId=9010')) return { data: [listItem] }
    if (url === '/vouchers/6741') return voucherDetailEnvelope
    throw new Error(`Unexpected GET ${url}`)
  }),
  postData: vi.fn(),
  putData: vi.fn(),
}))

const makeClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

const renderCard = (unitCode?: string | null) => {
  const client = makeClient()
  return render(
    <QueryClientProvider client={client}>
      <OpeningStockSummaryCard
        itemId={1003}
        unitCode={unitCode ?? 'BAG'}
        noOfDecimalPlaces={2}
      />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  linkClicks.length = 0
  authState.fiscalYearId = 2
})

describe('OpeningStockSummaryCard (item 1003 on voucher OPNS-1)', () => {
  it('shows the OPNSK voucher number badge and totals from the voucher', async () => {
    renderCard()

    // Voucher number badge next to the heading.
    expect(await screen.findByText('OPNS-1')).toBeTruthy()

    // Totals: 95.80 BAG, value 5,38,743.74 (en-IN grouping), weighted avg
    // rate = 538743.74 / 95.8 = 5623.63. The rate string appears 5 times —
    // the Avg Rate stat + the Rate column of all four godown rows (same
    // rate in this fixture) — so assert the count instead of uniqueness.
    expect(await screen.findByText('95.80 BAG')).toBeTruthy()
    expect(screen.getByText('5,38,743.74')).toBeTruthy()
    expect(screen.getAllByText('5,623.63').length).toBe(5)
    // Date rendered via the same toLocaleDateString call as the component.
    expect(
      screen.getByText(
        new Date('2026-04-01T00:00:00.000000Z').toLocaleDateString('en-IN'),
      ),
    ).toBeTruthy()
  })

  it('renders the per-godown breakdown for all four godowns with the batch badge', async () => {
    renderCard()

    await screen.findByText('OPNS-1')

    for (const godown of [
      'SANDIP GOYAL',
      'ASHISH GHOSH',
      'POKHRAJ1',
      'GOYANKHA GODWON',
    ]) {
      expect(screen.getByText(godown)).toBeTruthy()
    }
    // Batch badge (single badge element per row).
    const badges = screen.getAllByText('010426')
    expect(badges.length).toBe(4)

    // Per-godown quantities.
    expect(screen.getByText('7.15')).toBeTruthy()
    expect(screen.getByText('0.45')).toBeTruthy()
    expect(screen.getByText('40.75')).toBeTruthy()
    expect(screen.getByText('47.45')).toBeTruthy()
  })

  it("excludes other items' entries from the rows and totals", async () => {
    renderCard()

    await screen.findByText('OPNS-1')

    // Item 2001's 999 qty never appears; totals stay at 95.80.
    expect(screen.queryByText('999.00')).toBeNull()
    expect(screen.getByText('95.80 BAG')).toBeTruthy()
  })

  it('deep-links to the voucher $id route', async () => {
    renderCard()

    const link = await screen.findByTestId('opnsk-link')
    expect(link.getAttribute('href')).toBe(
      '/transactions/vouchers/opening_stock/$id',
    )
    expect(link.getAttribute('data-id')).toBe('6741')

    fireEvent.click(link)
    expect(linkClicks).toEqual(['/transactions/vouchers/opening_stock/$id'])
  })

  it('shows the empty state with an index-route link when the FY has no OPNSK voucher', async () => {
    authState.fiscalYearId = 3 // voucher 6741 belongs to FY 2
    renderCard()

    expect(
      await screen.findByText(
        'No opening stock recorded for this item in the current fiscal year.',
      ),
    ).toBeTruthy()

    const link = screen.getByTestId('opnsk-link')
    expect(link.getAttribute('href')).toBe(
      '/transactions/vouchers/opening_stock',
    )

    await waitFor(() => {
      // The detail query must never fire without a voucher id.
      expect(screen.queryByText('OPNS-1')).toBeNull()
    })
  })
})
