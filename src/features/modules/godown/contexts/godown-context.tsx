import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Godown } from '../data/schema'



type GodownDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface GodownContextType {
  open: GodownDialogType | null
  setOpen: (str: GodownDialogType | null) => void
  currentRow: Godown | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Godown | null>>
  keyName: string
}

const GodownContext = React.createContext<GodownContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function GodownProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<GodownDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Godown | null>(null)


  return (
    <GodownContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "godown" }}>
      {children}
    </GodownContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGodown = () => {
  const godownContext = React.useContext(GodownContext)

  if (!godownContext) {
    throw new Error('useGodown has to be used within <GodownContext>')
  }

  return godownContext
}
