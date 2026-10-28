import { describe, expect, it } from 'vitest'
import { dayBookExportStatus } from './export-status'

const deliveryNote = {
  voucherType: { id: 2001, name: 'Delivery Note' },
  referencedBy: [],
}

describe('dayBookExportStatus (report exports)', () => {
  it('keeps the plain status when there is no lock history', () => {
    expect(dayBookExportStatus(deliveryNote)).toBe('No Freight')
    expect(
      dayBookExportStatus({
        ...deliveryNote,
        referencedBy: [{ type: 'freight' }],
      }),
    ).toBe('Freight Done')
    expect(dayBookExportStatus({ voucherType: { id: 3001 } })).toBe('—')
  })

  it('reports a postponed delivery with its moment and reason', () => {
    const status = dayBookExportStatus({
      ...deliveryNote,
      deliveryLocked: true,
      deliveryLockReason: 'vehicle_failure',
      deliveryLockedAt: '2026-10-01T09:30:00',
    })

    expect(status).toContain('No Freight')
    expect(status).toContain('Postponed')
    expect(status).toContain('Vehicle failure')
    expect(status).toMatch(/09:30/)
  })

  it('reports a released delivery with both moments', () => {
    const status = dayBookExportStatus({
      ...deliveryNote,
      deliveryLocked: false,
      deliveryLockedAt: '2026-10-01T09:30:00',
      deliveryUnlockedAt: '2026-10-03T16:45:00',
    })

    expect(status).toContain('Postponed')
    expect(status).toContain('Released')
    expect(status).toMatch(/16:45/)
  })

  it('reads the lock of the referenced delivery note on other rows', () => {
    const status = dayBookExportStatus({
      voucherType: { id: 1006, name: 'Sales' },
      module: 'freight',
      paymentStatus: 'paid',
      voucherReferences: [
        {
          referenceVoucher: {
            id: 42,
            deliveryLocked: true,
            deliveryLockReason: 'other',
            deliveryLockedAt: '2026-10-01T09:30:00',
          },
        },
      ],
    })

    expect(status).toContain('Paid')
    expect(status).toContain('Postponed')
  })
})
