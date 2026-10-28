import type { DayBookSchema } from './schema'

type ReferencedVoucher = NonNullable<
  NonNullable<DayBookSchema['voucherReferences']>[number]['referenceVoucher']
>

/** The voucher holding the lock: the row itself or the note it references. */
export type DeliveryLockSource = DayBookSchema | ReferencedVoucher

/** Only delivery notes carry a delivery lock. */
const DELIVERY_NOTE_VOUCHER_TYPE_ID = 2001

/**
 * Voucher carrying the delivery lock for a day-book row.
 *
 * Delivery notes hold the lock themselves; sales / receipt-note rows read it
 * back through the delivery note they reference. Matching by reference (rather
 * than `module`, which is not set on every row) keeps the lock visible
 * everywhere the delivery is reported.
 */
export function resolveDeliveryLockSource(
  row: DayBookSchema,
): DeliveryLockSource | null {
  if (row.voucherType?.id === DELIVERY_NOTE_VOUCHER_TYPE_ID) {
    return row
  }

  return (
    row.voucherReferences?.find(
      (ref) =>
        ref.referenceVoucher?.deliveryLocked ||
        ref.referenceVoucher?.deliveryUnlockedAt,
    )?.referenceVoucher ?? null
  )
}
