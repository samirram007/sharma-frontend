'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { AccountNature } from '@/features/modules/account_nature/data/schema'
import { accountNatureQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AccountNature
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Account Nature"
      apiPath="/account_natures"
      currentRow={currentRow}
      queryKey={accountNatureQueryOptions().queryKey}
    />
  )
}
