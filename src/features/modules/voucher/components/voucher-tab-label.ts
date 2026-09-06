/**
 * Tiny store: the voucher record currently being edited announces itself, and
 * the tab strip (RecentTabs) appends its number to the active tab's title,
 * e.g. "Delivery Note (DLNT-4115)". Each edit page publishes while mounted
 * with an existing record and unpublishes on unmount, so the suffix never
 * outlives the page that produced it.
 */
export interface VoucherTabLabel {
  /** Pathname of the page the label belongs to. */
  pathname: string
  /** Suffix rendered after the tab title, already parenthesized. */
  label: string
}

let current: VoucherTabLabel | null = null
const listeners = new Set<() => void>()

export function publishVoucherTabLabel(next: VoucherTabLabel | null): void {
  const unchanged =
    next === null
      ? current === null
      : current !== null &&
        current.pathname === next.pathname &&
        current.label === next.label
  if (unchanged) return
  current = next
  listeners.forEach((listener) => listener())
}

export function getVoucherTabLabel(): VoucherTabLabel | null {
  return current
}

export function subscribeVoucherTabLabel(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
