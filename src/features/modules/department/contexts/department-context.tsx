import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Department } from '../data/schema'



type DepartmentDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface DepartmentContextType {
  open: DepartmentDialogType | null
  setOpen: (str: DepartmentDialogType | null) => void
  currentRow: Department | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Department | null>>
  keyName: string
}

const DepartmentContext = React.createContext<DepartmentContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function DepartmentProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DepartmentDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Department | null>(null)


  return (
    <DepartmentContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "department" }}>
      {children}
    </DepartmentContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDepartment = () => {
  const departmentContext = React.useContext(DepartmentContext)

  if (!departmentContext) {
    throw new Error('useDepartment has to be used within <DepartmentContext>')
  }

  return departmentContext
}
