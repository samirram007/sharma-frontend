import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DeliveryLockBadge from './delivery-lock-badge'
import { resolveDeliveryLockSource } from '../data/delivery-lock-source'
import type { DayBookSchema } from '../data/schema'

// Rights come from the auth profile in the app; the chip only needs the flags.
const { lockPermissions } = vi.hoisted(() => ({
  lockPermissions: { canView: true, canPostpone: true, canRelease: true },
}))
vi.mock('../../shared/delivery-lock-permissions', () => ({
  useDeliveryLockPermissions: () => lockPermissions,
}))

beforeEach(() => {
  lockPermissions.canView = true
})

// Overrides stay loosely typed: the chip only reads the lock fields, and the
// nested voucher schemas carry more required fields than these fixtures set.
const makeRow = (overrides: Record<string, unknown> = {}): DayBookSchema =>
  ({
    id: 8280,
    voucherNo: 'DLNT-7441',
    voucherDate: new Date('2026-09-28T00:00:00'),
    voucherTypeId: 2001,
    voucherType: { id: 2001, name: 'Delivery Note' },
    voucherEntries: [],
    deliveryLocked: false,
    ...overrides,
  }) as unknown as DayBookSchema

describe('Day Book delivery lock chip', () => {
  it('renders nothing when the delivery was never postponed', () => {
    const { container } = render(
      <DeliveryLockBadge row={makeRow()} />,
    )

    expect(container.textContent).toBe('')
  })

  it('shows Postponed for a locked delivery note', () => {
    render(
      <DeliveryLockBadge
        row={makeRow({
          deliveryLocked: true,
          deliveryLockReason: 'vehicle_failure',
          deliveryLockedAt: new Date('2026-10-01T09:30:00'),
        })}
      />,
    )

    expect(screen.getByText('Postponed')).toBeTruthy()
    // The lock icon rides with the label.
    expect(document.querySelector('svg')).toBeTruthy()
  })

  it('shows Released once the delivery was unlocked', () => {
    render(
      <DeliveryLockBadge
        row={makeRow({
          deliveryLocked: false,
          deliveryLockedAt: new Date('2026-10-01T09:30:00'),
          deliveryUnlockedAt: new Date('2026-10-03T16:45:00'),
        })}
      />,
    )

    expect(screen.getByText('Released')).toBeTruthy()
  })

  it('hides the state without DELIVERY_LOCK_VIEW', () => {
    lockPermissions.canView = false

    const { container } = render(
      <DeliveryLockBadge
        row={makeRow({ deliveryLocked: true, deliveryLockReason: 'other' })}
      />,
    )

    expect(container.textContent).toBe('')
  })

  it('reads the lock of the referenced delivery note on other rows', () => {
    const row = makeRow({
      id: 9100,
      voucherTypeId: 1006,
      voucherType: { id: 1006, name: 'Sales' },
      deliveryLocked: null,
      voucherReferences: [
        {
          id: 1,
          voucherId: 9100,
          refVoucherId: 8280,
          type: 'delivery_note',
          referenceVoucher: {
            id: 8280,
            voucherNo: 'DLNT-7441',
            voucherTypeId: 2001,
            voucherEntries: [],
            deliveryLocked: true,
            deliveryLockedAt: new Date('2026-10-01T09:30:00'),
          },
        },
      ],
    })

    expect(resolveDeliveryLockSource(row)?.id).toBe(8280)
    render(<DeliveryLockBadge row={row} />)
    expect(screen.getByText('Postponed')).toBeTruthy()
  })
})
