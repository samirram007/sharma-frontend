import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Currency } from '../data/schema'



type CurrencyDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface CurrencyContextType {
  open: CurrencyDialogType | null
  setOpen: (str: CurrencyDialogType | null) => void
  currentRow: Currency | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Currency | null>>
  keyName: string
}

const CurrencyContext = React.createContext<CurrencyContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function CurrencyProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<CurrencyDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Currency | null>(null)


  return (
    <CurrencyContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "account_nature" }}>
      {children}
    </CurrencyContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => {
  const currencyContext = React.useContext(CurrencyContext)

  if (!currencyContext) {
    throw new Error('useCurrency has to be used within <CurrencyContext>')
  }

  return currencyContext
}
