'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { State } from '@/features/modules/state/data/schema'
import { stateQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: State
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="State"
      apiPath="/states"
      currentRow={currentRow}
      queryKey={stateQueryOptions().queryKey}
    />
  )
}
