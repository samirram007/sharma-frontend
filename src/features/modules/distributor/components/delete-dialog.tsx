'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Distributor } from '../data/schema'
import { distributorQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Distributor
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Distributor"
      apiPath="/distributors"
      currentRow={currentRow}
      queryKey={distributorQueryOptions().queryKey}
    />
  )
}
