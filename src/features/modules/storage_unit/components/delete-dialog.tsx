'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { StorageUnit } from '@/features/modules/storage_unit/data/schema'
import { storageUnitQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: StorageUnit
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Storage Unit"
      apiPath="/storage_units"
      currentRow={currentRow}
      queryKey={storageUnitQueryOptions().queryKey}
    />
  )
}
