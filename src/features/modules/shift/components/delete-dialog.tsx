'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Shift } from '../data/schema'
import { shiftQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Shift
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Shift"
      apiPath="/shifts"
      currentRow={currentRow}
      queryKey={shiftQueryOptions().queryKey}
    />
  )
}
