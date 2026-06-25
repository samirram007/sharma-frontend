import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { UniqueQuantityCode } from '../data/schema'



type UniqueQuantityCodeDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface UniqueQuantityCodeContextType {
  open: UniqueQuantityCodeDialogType | null
  setOpen: (str: UniqueQuantityCodeDialogType | null) => void
  currentRow: UniqueQuantityCode | null
  setCurrentRow: React.Dispatch<React.SetStateAction<UniqueQuantityCode | null>>
}

const UniqueQuantityCodeContext = React.createContext<UniqueQuantityCodeContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UniqueQuantityCodeProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UniqueQuantityCodeDialogType>(null)
  const [currentRow, setCurrentRow] = useState<UniqueQuantityCode | null>(null)

  return (
    <UniqueQuantityCodeContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UniqueQuantityCodeContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUniqueQuantityCode = () => {
  const uniqueQuantityCodeContext = React.useContext(UniqueQuantityCodeContext)

  if (!uniqueQuantityCodeContext) {
    throw new Error('useUniqueQuantityCode has to be used within <UniqueQuantityCodeContext>')
  }

  return uniqueQuantityCodeContext
}
