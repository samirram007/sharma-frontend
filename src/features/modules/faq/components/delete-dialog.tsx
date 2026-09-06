'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { Faq } from '../data/schema'
import { faqQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Faq
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="FAQ"
      apiPath="/faqs"
      currentRow={currentRow}
      queryKey={faqQueryOptions().queryKey}
    />
  )
}
