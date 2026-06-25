import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { EmployeeGroup } from '../data/schema'



type EmployeeGroupDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface EmployeeGroupContextType {
  open: EmployeeGroupDialogType | null
  setOpen: (str: EmployeeGroupDialogType | null) => void
  currentRow: EmployeeGroup | null
  setCurrentRow: React.Dispatch<React.SetStateAction<EmployeeGroup | null>>
  keyName: string
}

const EmployeeGroupContext = React.createContext<EmployeeGroupContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function EmployeeGroupProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<EmployeeGroupDialogType>(null)
  const [currentRow, setCurrentRow] = useState<EmployeeGroup | null>(null)

  return (
    <EmployeeGroupContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "employee_groups" }}>
      {children}
    </EmployeeGroupContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useEmployeeGroup = () => {
  const employeeGroupContext = React.useContext(EmployeeGroupContext)

  if (!employeeGroupContext) {
    throw new Error('useEmployeeGroup has to be used within <EmployeeGroupContext>')
  }

  return employeeGroupContext
}
