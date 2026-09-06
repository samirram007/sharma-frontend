'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { VoucherType } from '@/features/modules/voucher_type/data/schema'
import { voucherTypeQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: VoucherType
}

export function VoucherTypesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Voucher Type"
      apiPath="/voucher_types"
      currentRow={currentRow}
      queryKey={voucherTypeQueryOptions().queryKey}
    />
  )
}
