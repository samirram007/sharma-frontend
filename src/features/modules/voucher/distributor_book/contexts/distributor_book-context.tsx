import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { DistributorBookSchema } from '../data/schema'




type DistributorBookDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface DistributorBookContextType {
  open: DistributorBookDialogType | null
  setOpen: (str: DistributorBookDialogType | null) => void
  currentRow: DistributorBookSchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<DistributorBookSchema | null>>
  keyName: string
}

const DistributorBookContext = React.createContext<DistributorBookContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function DistributorBookProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DistributorBookDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DistributorBookSchema | null>(null)

  return (
    <DistributorBookContext.Provider value={{ open, setOpen, currentRow, setCurrentRow, keyName: "distributor_books" }}>
      {children}
    </DistributorBookContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDistributorBook = () => {
  const distributorBookContext = React.useContext(DistributorBookContext)

  if (!distributorBookContext) {
    throw new Error('useDistributorBook has to be used within <DistributorBookContext>')
  }

  return distributorBookContext
}
