'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Transporter } from '../data/schema'
import { transporterQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Transporter
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Transporter"
      apiPath="/transporters"
      currentRow={currentRow}
      queryKey={transporterQueryOptions().queryKey}
    />
  )
}
