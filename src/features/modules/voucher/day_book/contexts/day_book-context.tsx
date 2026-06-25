import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { DayBookSchema } from '../data/schema'




type DayBookDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface DayBookContextType {
  open: DayBookDialogType | null
  setOpen: (str: DayBookDialogType | null) => void
  currentRow: DayBookSchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<DayBookSchema | null>>
  keyName: string
}

const DayBookContext = React.createContext<DayBookContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function DayBookProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DayBookDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DayBookSchema | null>(null)

  return (
    <DayBookContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "day_books" }}>
      {children}
    </DayBookContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDayBook = () => {
  const dayBookContext = React.useContext(DayBookContext)

  if (!dayBookContext) {
    throw new Error('useDayBook has to be used within <DayBookContext>')
  }

  return dayBookContext
}
