import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { AccountNature } from '../data/schema'



type AccountNatureDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface AccountNatureContextType {
  open: AccountNatureDialogType | null
  setOpen: (str: AccountNatureDialogType | null) => void
  currentRow: AccountNature | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AccountNature | null>>
  keyName: string
}

const AccountNatureContext = React.createContext<AccountNatureContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function AccountNatureProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<AccountNatureDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AccountNature | null>(null)


  return (
    <AccountNatureContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "account_nature" }}>
      {children}
    </AccountNatureContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAccountNature = () => {
  const accountNatureContext = React.useContext(AccountNatureContext)

  if (!accountNatureContext) {
    throw new Error('useAccountNature has to be used within <AccountNatureContext>')
  }

  return accountNatureContext
}
