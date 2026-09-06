'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Currency } from '@/features/modules/currency/data/schema'
import { currencyQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Currency
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Currency"
      apiPath="/currencies"
      currentRow={currentRow}
      queryKey={currencyQueryOptions().queryKey}
    />
  )
}
