import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Shift } from '../data/schema'



type ShiftDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface ShiftContextType {
  open: ShiftDialogType | null
  setOpen: (str: ShiftDialogType | null) => void
  currentRow: Shift | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Shift | null>>
  keyName: string
}

const ShiftContext = React.createContext<ShiftContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ShiftProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ShiftDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Shift | null>(null)


  return (
    <ShiftContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "shift" }}>
      {children}
    </ShiftContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useShift = () => {
  const shiftContext = React.useContext(ShiftContext)

  if (!shiftContext) {
    throw new Error('useShift has to be used within <ShiftContext>')
  }

  return shiftContext
}
