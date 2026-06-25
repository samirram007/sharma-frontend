import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { StockItem } from '../data/schema'



type StockItemDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface StockItemContextType {
  open: StockItemDialogType | null
  setOpen: (str: StockItemDialogType | null) => void
  currentRow: StockItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StockItem | null>>
  keyName: string,
  config: { key: string, value: boolean }[]
}

const StockItemContext = React.createContext<StockItemContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function StockItemProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<StockItemDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StockItem | null>(null)
  const config = [
    { key: 'alternate_units', value: true },
    { key: 'batch_serial', value: true },
    { key: 'opening_balance', value: false },
  ]

  return (
    <StockItemContext value={{ open, setOpen, currentRow, setCurrentRow, config, keyName: "account_nature" }}>
      {children}
    </StockItemContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStockItem = () => {
  const stockitemContext = React.useContext(StockItemContext)

  if (!stockitemContext) {
    throw new Error('useStockItem has to be used within <StockItemContext>')
  }

  return stockitemContext
}
