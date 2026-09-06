'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Department } from '../data/schema'
import { departmentQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Department
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Department"
      apiPath="/departments"
      currentRow={currentRow}
      queryKey={departmentQueryOptions().queryKey}
    />
  )
}
