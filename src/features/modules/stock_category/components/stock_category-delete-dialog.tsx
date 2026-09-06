'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { StockCategory } from '../data/schema'
import { stockCategoryQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: StockCategory
}

export function StockCategoryDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Stock Category"
      apiPath="/stock_categories"
      currentRow={currentRow}
      queryKey={stockCategoryQueryOptions().queryKey}
    />
  )
}
