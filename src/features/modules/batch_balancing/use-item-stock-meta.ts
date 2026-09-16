import { useQuery } from '@tanstack/react-query'
import { stockSummaryQueryOptions } from '@/features/modules/voucher/stock_summary/data/queryOptions'
import type { StockInHandItemWiseSchema } from '@/features/modules/voucher/stock_summary/data/schema'

/**
 * Closing stock qty (with unit) per item, from the shared stock-in-hand
 * item-wise summary — shown as right-aligned meta in the Item sheet.
 */
export function useItemStockMeta(enabled: boolean) {
  const { data } = useQuery({
    ...stockSummaryQueryOptions('stock_in_hand_item_wise'),
    enabled,
  })

  const rows = (data?.data ?? []) as unknown as StockInHandItemWiseSchema[]
  const map = new Map<number, string>()
  for (const row of rows) {
    if (typeof row.itemId !== 'number') continue
    const qty = (row.closingQuantity ?? 0).toLocaleString('en-IN', {
      minimumFractionDigits: row.noOfDecimalPlaces ?? 2,
      maximumFractionDigits: row.noOfDecimalPlaces ?? 2,
    })
    map.set(row.itemId, row.unitCode ? `${qty} ${row.unitCode}` : qty)
  }
  return map
}
