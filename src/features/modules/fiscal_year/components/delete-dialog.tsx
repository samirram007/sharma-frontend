'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { FiscalYear } from '@/features/modules/fiscal_year/data/schema'
import { fiscalYearQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: FiscalYear
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Fiscal Year"
      apiPath="/fiscal_years"
      currentRow={currentRow}
      queryKey={fiscalYearQueryOptions().queryKey}
    />
  )
}
