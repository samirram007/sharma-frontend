import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Supplier } from '../data/schema'



type SupplierDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface SupplierContextType {
  open: SupplierDialogType | null
  setOpen: (str: SupplierDialogType | null) => void
  currentRow: Supplier | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Supplier | null>>
  keyName: string
}

const SupplierContext = React.createContext<SupplierContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function SupplierProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<SupplierDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Supplier | null>(null)


  return (
    <SupplierContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "supplier" }}>
      {children}
    </SupplierContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSupplier = () => {
  const supplierContext = React.useContext(SupplierContext)

  if (!supplierContext) {
    throw new Error('useSupplier has to be used within <SupplierContext>')
  }

  return supplierContext
}
