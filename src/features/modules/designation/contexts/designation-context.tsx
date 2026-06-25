import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Designation } from '../data/schema'



type DesignationDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface DesignationContextType {
  open: DesignationDialogType | null
  setOpen: (str: DesignationDialogType | null) => void
  currentRow: Designation | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Designation | null>>
  keyName: string
}

const DesignationContext = React.createContext<DesignationContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function DesignationProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DesignationDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Designation | null>(null)


  return (
    <DesignationContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "designation" }}>
      {children}
    </DesignationContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDesignation = () => {
  const designationContext = React.useContext(DesignationContext)

  if (!designationContext) {
    throw new Error('useDesignation has to be used within <DesignationContext>')
  }

  return designationContext
}
