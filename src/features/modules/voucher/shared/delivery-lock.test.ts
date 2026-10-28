import { describe, expect, it } from 'vitest'
import {
  DELIVERY_LOCK_REASONS,
  deliveryLockMoment,
  deliveryLockReasonLabel,
  deliveryLockSummary,
  deliveryUnlockSummary,
  toDateTimeLocalValue,
} from './delivery-lock'

describe('delivery lock reason presets', () => {
  it('matches the reasons the backend validates', () => {
    expect(DELIVERY_LOCK_REASONS.map((reason) => reason.value)).toEqual([
      'vehicle_failure',
      'uncertain_situation',
      'party_unavailable',
      'other',
    ])
  })

  it('maps preset keys to labels and falls back to the raw value', () => {
    expect(deliveryLockReasonLabel('vehicle_failure')).toBe('Vehicle failure')
    expect(deliveryLockReasonLabel('party_unavailable')).toBe(
      'Party unavailable',
    )
    // Unknown/legacy keys still render something readable instead of blank.
    expect(deliveryLockReasonLabel('some_new_reason')).toBe('some_new_reason')
    expect(deliveryLockReasonLabel(null)).toBeUndefined()
    expect(deliveryLockReasonLabel(undefined)).toBeUndefined()
  })
})

describe('deliveryLockSummary', () => {
  it('is undefined for a delivery that is not locked', () => {
    expect(
      deliveryLockSummary({
        deliveryLocked: false,
        deliveryLockReason: 'vehicle_failure',
      }),
    ).toBeUndefined()
    expect(deliveryLockSummary({})).toBeUndefined()
  })

  it('joins reason, note, date and locker into one line', () => {
    const summary = deliveryLockSummary({
      deliveryLocked: true,
      deliveryLockReason: 'vehicle_failure',
      deliveryLockNote: 'Vehicle broke down on NH-33',
      deliveryLockedAt: '2026-10-10T09:30:00.000Z',
      deliveryLockedByName: 'Ravi',
    })

    expect(summary).toContain('Vehicle failure')
    expect(summary).toContain('Vehicle broke down on NH-33')
    expect(summary).toContain('by Ravi')
    expect(summary).toMatch(/2026/)
  })

  it('formats lock moments for the list and datetime-local inputs', () => {
    expect(deliveryLockMoment('2026-10-10T09:30:00')).toMatch(/2026/)
    expect(deliveryLockMoment('2026-10-10T09:30:00')).toMatch(/09:30|9:30/)
    expect(deliveryLockMoment(null)).toBeUndefined()
    expect(deliveryLockMoment('not-a-date')).toBeUndefined()

    expect(toDateTimeLocalValue('2026-10-10T09:30:00')).toBe('2026-10-10T09:30')
    expect(toDateTimeLocalValue(null)).toBe('')
    expect(toDateTimeLocalValue('not-a-date')).toBe('')
  })

  it('describes the release of a postponed delivery', () => {
    expect(
      deliveryUnlockSummary({
        deliveryUnlockedAt: '2026-10-12T10:00:00',
        deliveryUnlockedByName: 'Ravi',
      }),
    ).toMatch(/^Released .*2026.* by Ravi$/)

    // Nothing to show while the delivery is still postponed.
    expect(deliveryUnlockSummary({})).toBeUndefined()
  })

  it('never returns an empty string for a locked row', () => {
    expect(deliveryLockSummary({ deliveryLocked: true })).toBe('Postponed')
    expect(
      deliveryLockSummary({
        deliveryLocked: true,
        deliveryLockReason: 'other',
      }),
    ).toBe('Other')
  })
})
