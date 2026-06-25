import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { AccountGroup } from '../data/schema'



type AccountGroupDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface AccountGroupContextType {
  open: AccountGroupDialogType | null
  setOpen: (str: AccountGroupDialogType | null) => void
  currentRow: AccountGroup | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AccountGroup | null>>
}

const AccountGroupContext = React.createContext<AccountGroupContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function AccountGroupProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<AccountGroupDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AccountGroup | null>(null)

  return (
    <AccountGroupContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AccountGroupContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAccountGroup = () => {
  const accountGroupContext = React.useContext(AccountGroupContext)

  if (!accountGroupContext) {
    throw new Error('useAccountGroup has to be used within <AccountGroupContext>')
  }

  return accountGroupContext
}
