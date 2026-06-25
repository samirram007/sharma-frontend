import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { FiscalYear } from '../data/schema'



type FiscalYearDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface FiscalYearContextType {
  open: FiscalYearDialogType | null
  setOpen: (str: FiscalYearDialogType | null) => void
  currentRow: FiscalYear | null
  setCurrentRow: React.Dispatch<React.SetStateAction<FiscalYear | null>>
  keyName: string
}

const FiscalYearContext = React.createContext<FiscalYearContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function FiscalYearProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<FiscalYearDialogType>(null)
  const [currentRow, setCurrentRow] = useState<FiscalYear | null>(null)


  return (
    <FiscalYearContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "fiscalyear" }}>
      {children}
    </FiscalYearContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFiscalYear = () => {
  const fiscalYearContext = React.useContext(FiscalYearContext)

  if (!fiscalYearContext) {
    throw new Error('useFiscalYear has to be used within <FiscalYearContext>')
  }

  return fiscalYearContext
}
