'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { AccountLedger } from '@/features/modules/account_ledger/data/schema'
import { accountLedgerQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AccountLedger
}

export function AccountLedgersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Account Ledger"
      apiPath="/account_ledgers"
      currentRow={currentRow}
      queryKey={accountLedgerQueryOptions().queryKey}
    />
  )
}
