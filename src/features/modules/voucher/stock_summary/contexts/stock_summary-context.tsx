import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { StockSummarySchema } from '../data/schema'




type StockSummaryDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface StockSummaryContextType {
  open: StockSummaryDialogType | null
  setOpen: (str: StockSummaryDialogType | null) => void
  currentRow: StockSummarySchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StockSummarySchema | null>>
  currentReport: string
  setCurrentReport: React.Dispatch<React.SetStateAction<string>>
  keyName: string
}

const StockSummaryContext = React.createContext<StockSummaryContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function StockSummaryProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<StockSummaryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StockSummarySchema | null>(null)
  const [currentReport, setCurrentReport] = useState('stock_in_hand');
  return (
    <StockSummaryContext.Provider value={{
      open, setOpen,
      currentRow, setCurrentRow, currentReport, setCurrentReport, keyName: "day_books"
    }}>
      {children}
    </StockSummaryContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStockSummary = () => {
  const stockSummaryContext = React.useContext(StockSummaryContext)

  if (!stockSummaryContext) {
    throw new Error('useStockSummary has to be used within <StockSummaryContext>')
  }

  return stockSummaryContext
}
