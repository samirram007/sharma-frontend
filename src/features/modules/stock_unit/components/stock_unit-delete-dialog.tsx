'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { StockUnit } from '../data/schema'
import { stockUnitQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: StockUnit
}

export function StockUnitDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Stock Unit"
      apiPath="/stock_units"
      currentRow={currentRow}
      queryKey={stockUnitQueryOptions().queryKey}
    />
  )
}
