'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { StockGroup } from '../data/schema'
import { stockGroupQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: StockGroup
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Stock Group"
      apiPath="/stock_groups"
      currentRow={currentRow}
      queryKey={stockGroupQueryOptions().queryKey}
    />
  )
}
