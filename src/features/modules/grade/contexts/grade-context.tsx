import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Grade } from '../data/schema'



type GradeDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface GradeContextType {
  open: GradeDialogType | null
  setOpen: (str: GradeDialogType | null) => void
  currentRow: Grade | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Grade | null>>
  keyName: string
}

const GradeContext = React.createContext<GradeContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function GradeProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<GradeDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Grade | null>(null)


  return (
    <GradeContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "grade" }}>
      {children}
    </GradeContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGrade = () => {
  const gradeContext = React.useContext(GradeContext)

  if (!gradeContext) {
    throw new Error('useGrade has to be used within <GradeContext>')
  }

  return gradeContext
}
