import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Company } from '../data/schema'



type CompanyDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface CompanyContextType {
  open: CompanyDialogType | null
  setOpen: (str: CompanyDialogType | null) => void
  currentRow: Company | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Company | null>>
  keyName: string
}

const CompanyContext = React.createContext<CompanyContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function CompanyProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<CompanyDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Company | null>(null)


  return (
    <CompanyContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "company" }}>
      {children}
    </CompanyContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCompany = () => {
  const companyContext = React.useContext(CompanyContext)

  if (!companyContext) {
    throw new Error('useCompany has to be used within <CompanyContext>')
  }

  return companyContext
}
