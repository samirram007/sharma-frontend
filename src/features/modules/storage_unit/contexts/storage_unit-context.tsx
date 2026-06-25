import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { StorageUnit } from '../data/schema'



type StorageUnitDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface StorageUnitContextType {
  open: StorageUnitDialogType | null
  setOpen: (str: StorageUnitDialogType | null) => void
  currentRow: StorageUnit | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StorageUnit | null>>
  keyName: string
}

const StorageUnitContext = React.createContext<StorageUnitContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function StorageUnitProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<StorageUnitDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StorageUnit | null>(null)


  return (
    <StorageUnitContext.Provider value={{ open, setOpen, currentRow, setCurrentRow, keyName: "storageUnit" }}>
      {children}
    </StorageUnitContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStorageUnit = () => {
  const storageunitContext = React.useContext(StorageUnitContext)

  if (!storageunitContext) {
    throw new Error('useStorageUnit has to be used within <StorageUnitContext>')
  }

  return storageunitContext
}
