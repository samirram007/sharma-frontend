import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Distributor } from '../data/schema'



type DistributorDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface DistributorContextType {
  open: DistributorDialogType | null
  setOpen: (str: DistributorDialogType | null) => void
  currentRow: Distributor | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Distributor | null>>
  keyName: string
}

const DistributorContext = React.createContext<DistributorContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function DistributorProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DistributorDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Distributor | null>(null)


  return (
    <DistributorContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "distributor" }}>
      {children}
    </DistributorContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDistributor = () => {
  const distributorContext = React.useContext(DistributorContext)

  if (!distributorContext) {
    throw new Error('useDistributor has to be used within <DistributorContext>')
  }

  return distributorContext
}
