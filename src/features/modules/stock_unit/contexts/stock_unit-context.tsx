import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { StockUnit } from '../data/schema'



type StockUnitDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface StockUnitContextType {
  open: StockUnitDialogType | null
  setOpen: (str: StockUnitDialogType | null) => void
  currentRow: StockUnit | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StockUnit | null>>
}

const StockUnitContext = React.createContext<StockUnitContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function StockUnitProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<StockUnitDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StockUnit | null>(null)

  return (
    <StockUnitContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StockUnitContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStockUnit = () => {
  const stockUnitContext = React.useContext(StockUnitContext)

  if (!stockUnitContext) {
    throw new Error('useStockUnit has to be used within <StockUnitContext>')
  }

  return stockUnitContext
}
