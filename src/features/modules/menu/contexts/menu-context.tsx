import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Menu } from '../data/schema'

type DialogType = 'add' | 'edit' | 'delete'

interface ContextType {
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentRow: Menu | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Menu | null>>
}

const MenuContext = React.createContext<ContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function MenuProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<Menu | null>(null)

  return (
    <MenuContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </MenuContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMenu = () => {
  const context = React.useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider')
  }
  return context
}
