'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { VoucherCategory } from '@/features/modules/voucher_category/data/schema'
import { voucherCategoryQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: VoucherCategory
}

export function VoucherCategorysDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Voucher Category"
      apiPath="/voucher_categories"
      currentRow={currentRow}
      queryKey={voucherCategoryQueryOptions().queryKey}
    />
  )
}
