import { fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import StatusCell from './status-cell'
import type { VoucherSchema } from '../../data-schema/voucher-schema'

// The cell only needs the provider's openLock — the real FreightProvider
// pulls in the print dialog, localStorage config and the API layer.
const openLock = vi.fn()
vi.mock('../contexts/freight-context', () => ({
  useFreight: () => ({ openLock }),
}))

// Delivery-lock rights come from the auth profile; the cell only reads them.
const { lockPermissions } = vi.hoisted(() => ({
  lockPermissions: { canView: true, canPostpone: true, canRelease: true },
}))
vi.mock('../../shared/delivery-lock-permissions', () => ({
  useDeliveryLockPermissions: () => lockPermissions,
}))

const makeVoucher = (overrides: Partial<VoucherSchema> = {}): VoucherSchema =>
  ({
    id: 917,
    voucherNo: 'DLNT-917',
    voucherDate: '2026-10-01T00:00:00.000000Z',
    voucherTypeId: 2001,
    voucherEntries: [],
    deliveryLocked: false,
    ...overrides,
  }) as VoucherSchema

const renderCell = (voucher: VoucherSchema) =>
  render(
    createElement(StatusCell, {
      row: { original: voucher },
    } as unknown as Parameters<typeof StatusCell>[0]),
  )

beforeEach(() => {
  openLock.mockClear()
  lockPermissions.canView = true
  lockPermissions.canPostpone = true
  lockPermissions.canRelease = true
})

describe('freight grid StatusCell', () => {
  it('shows no postponed badge for a regular delivery', () => {
    renderCell(makeVoucher())

    expect(screen.queryByText('Postponed')).toBeNull()
    expect(screen.getByTitle('Postpone (lock) this delivery')).toBeTruthy()
  })

  it('shows the postponed badge when the delivery is locked', () => {
    renderCell(
      makeVoucher({
        deliveryLocked: true,
        deliveryLockReason: 'vehicle_failure',
        deliveryLockNote: 'Vehicle broke down on NH-33',
      }),
    )

    // The badge carries the recorded reason (falls back to "Postponed").
    expect(screen.getByText('Vehicle failure')).toBeTruthy()
    expect(
      screen.getByTitle('Edit reason or unlock this delivery'),
    ).toBeTruthy()
  })

  it('hides the postpone action without DELIVERY_LOCK_POSTPONE', () => {
    lockPermissions.canPostpone = false
    renderCell(makeVoucher({ deliveryLocked: false }))

    expect(screen.queryByTitle('Postpone (lock) this delivery')).toBeNull()
  })

  it('shows a postponed delivery read-only with only VIEW', () => {
    lockPermissions.canPostpone = false
    lockPermissions.canRelease = false
    renderCell(
      makeVoucher({ deliveryLocked: true, deliveryLockReason: 'vehicle_failure' }),
    )

    // The state stays visible, the action does not.
    expect(screen.getByText('Vehicle failure')).toBeTruthy()
    expect(
      screen.queryByTitle('Edit reason or unlock this delivery'),
    ).toBeNull()
  })

  it('hides the state entirely without DELIVERY_LOCK_VIEW', () => {
    lockPermissions.canView = false
    renderCell(
      makeVoucher({ deliveryLocked: true, deliveryLockReason: 'vehicle_failure' }),
    )

    expect(screen.queryByText('Vehicle failure')).toBeNull()
  })

  it('opens the lock dialog with the row voucher', () => {
    const voucher = makeVoucher({ deliveryLocked: true })
    renderCell(voucher)

    fireEvent.click(screen.getByTitle('Edit reason or unlock this delivery'))

    expect(openLock).toHaveBeenCalledTimes(1)
    expect(openLock).toHaveBeenCalledWith(voucher)
  })
})
