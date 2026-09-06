'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Godown } from '../data/schema'
import { godownQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Godown
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Godown"
      apiPath="/godowns"
      currentRow={currentRow}
      queryKey={godownQueryOptions().queryKey}
    />
  )
}
