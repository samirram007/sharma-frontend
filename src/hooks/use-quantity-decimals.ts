import { getQuantityDecimals } from '@/utils/format-num'

/**
 * Resolves the number of decimal places a stock quantity should display:
 * the stock unit's noOfDecimalPlaces when set, otherwise 2.
 *
 * Thin React-friendly wrapper over getQuantityDecimals so components can
 * derive the precision from a (possibly reactive) noOfDecimalPlaces value
 * without repeating the `?? 2` fallback everywhere.
 *
 * @example
 *   const qtyDecimalPlaces = useQuantityDecimals(selectedStockUnit?.noOfDecimalPlaces)
 */
export function useQuantityDecimals(noOfDecimalPlaces?: number | null): number {
  return getQuantityDecimals(noOfDecimalPlaces)
}
