import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { StockGroup } from '../data/schema'



type StockGroupDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface StockGroupContextType {
  open: StockGroupDialogType | null
  setOpen: (str: StockGroupDialogType | null) => void
  currentRow: StockGroup | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StockGroup | null>>
  keyName: string
}

const StockGroupContext = React.createContext<StockGroupContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function StockGroupProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<StockGroupDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StockGroup | null>(null)

  return (
    <StockGroupContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "stock_groups" }}>
      {children}
    </StockGroupContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStockGroup = () => {
  const stockGroupContext = React.useContext(StockGroupContext)

  if (!stockGroupContext) {
    throw new Error('useStockGroup has to be used within <StockGroupContext>')
  }

  return stockGroupContext
}
