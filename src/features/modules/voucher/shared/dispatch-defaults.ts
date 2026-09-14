/**
 * Defaulting helpers shared by the dispatch-detail editors that hang off a
 * voucher: the freight grid's Bill cell (bill-cell.tsx), the delivery-note
 * summary dialog's Dispatch Details button (dispatch-details-button.tsx), and
 * the summary card itself (voucher-no-summary-dialog.tsx).
 *
 * The rule everywhere is the same:
 *  - The saved dispatch detail wins.
 *  - When nothing is saved (or zero), fall back to the calculated weight —
 *    the sum of the voucher's stock-journal entries' actual quantities.
 *  - Otherwise 0.
 */

type StockJournalEntryLike =
  | {
      actualQuantity?: number | string | null
    }
  | null
  | undefined

type VoucherWithDispatch = {
  voucherDispatchDetail?: { weight?: number | string | null } | null
  stockJournal?: {
    stockJournalEntries?: StockJournalEntryLike[] | null
  } | null
}

/**
 * Calculated weight for a voucher: the sum of its stock-journal entries'
 * actual quantities. The API returns string decimals, so each value is
 * coerced with Number() — a nullish/NaN quantity counts as 0.
 */
export function computeStockJournalWeight(
  voucher: VoucherWithDispatch | null | undefined,
): number {
  const entries = voucher?.stockJournal?.stockJournalEntries ?? []

  return entries.reduce<number>((sum, entry) => {
    return sum + (Number(entry?.actualQuantity) || 0)
  }, 0)
}

/**
 * Weight to prefill a dispatch-detail form with: the saved dispatch-detail
 * weight when set (non-zero), otherwise the calculated stock-journal weight,
 * otherwise 0.
 */
export function resolveDispatchWeight(
  voucher: VoucherWithDispatch | null | undefined,
): number {
  return (
    Number(voucher?.voucherDispatchDetail?.weight) ||
    computeStockJournalWeight(voucher)
  )
}
