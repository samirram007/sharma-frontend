'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { EmployeeGroup } from '../data/schema'
import { employeeGroupQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: EmployeeGroup
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Employee Group"
      apiPath="/employee_groups"
      currentRow={currentRow}
      queryKey={employeeGroupQueryOptions().queryKey}
    />
  )
}
