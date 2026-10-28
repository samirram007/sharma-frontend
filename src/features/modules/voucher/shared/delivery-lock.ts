/**
 * Preset reasons a delivery note can be locked (postponed) with from the
 * Freight screen — e.g. the vehicle failed or the situation is uncertain.
 *
 * The lock is an indicator only: it records why a delivery is postponed so it
 * can be filtered and reported, it does not block any edits.
 *
 * Keep in sync with App\Enums\DeliveryLockReason on the backend (the API
 * validates `reason` against that enum).
 */
export const DELIVERY_LOCK_REASONS = [
  { value: 'vehicle_failure', label: 'Vehicle failure' },
  { value: 'uncertain_situation', label: 'Uncertain situation' },
  { value: 'party_unavailable', label: 'Party unavailable' },
  { value: 'other', label: 'Other' },
] as const

export type DeliveryLockReasonValue =
  (typeof DELIVERY_LOCK_REASONS)[number]['value']

/** Human label for a stored preset key (falls back to the raw value). */
export function deliveryLockReasonLabel(
  reason?: string | null,
): string | undefined {
  if (!reason) {
    return undefined
  }

  return (
    DELIVERY_LOCK_REASONS.find((item) => item.value === reason)?.label ?? reason
  )
}

/**
 * Format a lock/unlock moment as "10-Oct-2026, 09:30" (local time).
 * Returns undefined for empty or unparsable values.
 */
export function deliveryLockMoment(
  value?: Date | string | null,
): string | undefined {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return `${date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}, ${date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

/**
 * Value for an `<input type="datetime-local">` — "YYYY-MM-DDTHH:mm" in local
 * time. Returns '' for empty/unparsable values (the input then shows the
 * placeholder and the API falls back to "now").
 */
export function toDateTimeLocalValue(value?: Date | string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * One-line description of a row's lock state, e.g.
 * "Vehicle failure — Vehicle broke down on NH-33 (10-Oct-2026, 09:30)".
 * Returns undefined when the delivery is not locked.
 */
export function deliveryLockSummary(voucher: {
  deliveryLocked?: boolean | null
  deliveryLockReason?: string | null
  deliveryLockNote?: string | null
  deliveryLockedAt?: Date | string | null
  deliveryLockedByName?: string | null
}): string | undefined {
  if (!voucher.deliveryLocked) {
    return undefined
  }

  const parts: string[] = []
  const reason = deliveryLockReasonLabel(voucher.deliveryLockReason)
  if (reason) {
    parts.push(reason)
  }
  if (voucher.deliveryLockNote) {
    parts.push(voucher.deliveryLockNote)
  }

  let summary = parts.join(' — ')
  const lockedAt = deliveryLockMoment(voucher.deliveryLockedAt)
  if (lockedAt) {
    summary += ` (${lockedAt})`
  }
  if (voucher.deliveryLockedByName) {
    summary += ` · by ${voucher.deliveryLockedByName}`
  }

  return summary || 'Postponed'
}

/**
 * Release line for a delivery that was postponed and later unlocked, e.g.
 * "Released 12-Oct-2026, 10:00 · by Ravi". Undefined while still postponed.
 */
export function deliveryUnlockSummary(voucher: {
  deliveryUnlockedAt?: Date | string | null
  deliveryUnlockedByName?: string | null
}): string | undefined {
  const releasedAt = deliveryLockMoment(voucher.deliveryUnlockedAt)
  if (!releasedAt) {
    return undefined
  }

  const by = voucher.deliveryUnlockedByName
    ? ` · by ${voucher.deliveryUnlockedByName}`
    : ''

  return `Released ${releasedAt}${by}`
}
