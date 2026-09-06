'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { UniqueQuantityCode } from '../data/schema'
import { uniqueQuantityCodeQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: UniqueQuantityCode
}

export function UniqueQuantityCodeDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Unique Quantity Code"
      apiPath="/unique_quantity_codes"
      currentRow={currentRow}
      queryKey={uniqueQuantityCodeQueryOptions().queryKey}
    />
  )
}
