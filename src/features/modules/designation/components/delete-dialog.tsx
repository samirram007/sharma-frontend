'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Designation } from '../data/schema'
import { designationQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Designation
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Designation"
      apiPath="/designations"
      currentRow={currentRow}
      queryKey={designationQueryOptions().queryKey}
    />
  )
}
