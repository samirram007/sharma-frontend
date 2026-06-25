import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { AccountLedger } from '../data/schema'



type AccountLedgerDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface AccountLedgerContextType {
  open: AccountLedgerDialogType | null
  setOpen: (str: AccountLedgerDialogType | null) => void
  currentRow: AccountLedger | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AccountLedger | null>>
}

const AccountLedgerContext = React.createContext<AccountLedgerContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function AccountLedgerProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<AccountLedgerDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AccountLedger | null>(null)

  return (
    <AccountLedgerContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AccountLedgerContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAccountLedger = () => {
  const accountLedgerContext = React.useContext(AccountLedgerContext)

  if (!accountLedgerContext) {
    throw new Error('useAccountLedger has to be used within <AccountLedgerContext>')
  }

  return accountLedgerContext
}
