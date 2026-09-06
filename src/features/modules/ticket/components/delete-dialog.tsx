'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Ticket } from '../data/schema'
import { ticketQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Ticket
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Ticket"
      apiPath="/tickets"
      currentRow={currentRow}
      queryKey={ticketQueryOptions().queryKey}
    />
  )
}
