'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Supplier } from '../data/schema'
import { supplierQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Supplier
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Supplier"
      apiPath="/suppliers"
      currentRow={currentRow}
      queryKey={supplierQueryOptions().queryKey}
    />
  )
}
