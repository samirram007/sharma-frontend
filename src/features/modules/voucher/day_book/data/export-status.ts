import {
  deliveryLockMoment,
  deliveryLockReasonLabel,
} from '../../shared/delivery-lock'

/**
 * Status text used by the Day Book report exports (PDF/Excel).
 *
 * Mirrors the on-screen Status cell: freight done / payment state for the row
 * itself, plus the delivery-lock chip — read from the delivery note itself, or
 * from the referenced delivery note for sales/receipt-note rows.
 *
 * Examples:
 *   "No Freight · Postponed — 01-Oct-2026, 09:30 (Vehicle failure)"
 *   "Paid · Postponed 01-Oct-2026, 09:30 → Released 03-Oct-2026, 16:45"
 */
export function dayBookExportStatus(row: any): string {
  let status = '—'

  if (row?.voucherType?.id === 2001) {
    const hasFreight = row.referencedBy?.some(
      (ref: any) => ref.type === 'freight',
    )
    status = hasFreight ? 'Freight Done' : 'No Freight'
  } else if (row?.module === 'freight') {
    const paymentStatus = row.paymentStatus ?? 'unpaid'
    status =
      paymentStatus === 'paid'
        ? 'Paid'
        : paymentStatus === 'partially_paid'
          ? 'Partial'
          : 'Unpaid'
  }

  const lockSource =
    row?.voucherType?.id === 2001
      ? row
      : (row?.voucherReferences?.find(
          (ref: any) =>
            ref.referenceVoucher?.deliveryLocked ||
            ref.referenceVoucher?.deliveryUnlockedAt,
        )?.referenceVoucher ?? null)

  if (!lockSource) {
    return status
  }

  const lockedAt = deliveryLockMoment(lockSource.deliveryLockedAt)
  const releasedAt = deliveryLockMoment(lockSource.deliveryUnlockedAt)

  let lockText: string | undefined
  if (lockSource.deliveryLocked) {
    const reason = deliveryLockReasonLabel(lockSource.deliveryLockReason)
    lockText = [
      'Postponed',
      lockedAt ? `— ${lockedAt}` : '',
      reason ? `(${reason})` : '',
    ]
      .filter(Boolean)
      .join(' ')
  } else if (releasedAt) {
    lockText = [
      lockedAt ? `Postponed ${lockedAt}` : '',
      `Released ${releasedAt}`,
    ]
      .filter(Boolean)
      .join(' → ')
  }

  if (!lockText) {
    return status
  }

  return status === '—' ? lockText : `${status} · ${lockText}`
}
