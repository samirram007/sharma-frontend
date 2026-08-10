import type { OpeningStockVoucher } from '../../data/schema'

export interface OpeningStockProps {
  currentRow?: OpeningStockVoucher
}

/** Summary of the previous fiscal year's closing stock loaded into the grid. */
export interface ClosingInfo {
  fyName: string
  voucherNo: string
  itemCount: number
  source?: 'closing_journal' | 'running'
}
