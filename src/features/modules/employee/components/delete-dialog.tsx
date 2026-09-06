'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Employee } from '../data/schema'
import { employeeQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Employee
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Employee"
      apiPath="/employees"
      currentRow={currentRow}
      queryKey={employeeQueryOptions().queryKey}
    />
  )
}
