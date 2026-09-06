'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { AccountGroup } from '@/features/modules/account_group/data/schema'
import { accountGroupQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AccountGroup
}

export function AccountGroupDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Account Group"
      apiPath="/account_groups"
      currentRow={currentRow}
      queryKey={accountGroupQueryOptions().queryKey}
    />
  )
}
