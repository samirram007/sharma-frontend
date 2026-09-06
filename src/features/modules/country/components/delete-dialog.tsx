'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Country } from '@/features/modules/country/data/schema'
import { countryQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Country
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Country"
      apiPath="/countries"
      currentRow={currentRow}
      queryKey={countryQueryOptions().queryKey}
    />
  )
}
