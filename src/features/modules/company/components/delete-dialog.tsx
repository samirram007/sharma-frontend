'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Company } from '@/features/modules/company/data/schema'
import { companyQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Company
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Company"
      apiPath="/companies"
      currentRow={currentRow}
      queryKey={companyQueryOptions().queryKey}
    />
  )
}
