'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { StockItem } from '@/features/modules/stock_item/data/schema'
import { stockItemQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: StockItem
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Stock Item"
      apiPath="/stock_items"
      currentRow={currentRow}
      queryKey={stockItemQueryOptions().queryKey}
    />
  )
}
