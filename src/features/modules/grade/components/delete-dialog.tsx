'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Grade } from '../data/schema'
import { gradeQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Grade
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Grade"
      apiPath="/grades"
      currentRow={currentRow}
      queryKey={gradeQueryOptions().queryKey}
    />
  )
}
