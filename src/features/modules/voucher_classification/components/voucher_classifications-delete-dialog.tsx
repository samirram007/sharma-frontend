'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { VoucherClassification } from '@/features/modules/voucher_classification/data/schema'
import { voucherClassificationQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: VoucherClassification
}

export function VoucherClassificationsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Voucher Classification"
      apiPath="/voucher_classifications"
      currentRow={currentRow}
      queryKey={voucherClassificationQueryOptions().queryKey}
    />
  )
}
