import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { StockCategory } from '../data/schema'



type StockCategoryDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface StockCategoryContextType {
  open: StockCategoryDialogType | null
  setOpen: (str: StockCategoryDialogType | null) => void
  currentRow: StockCategory | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StockCategory | null>>
}

const StockCategoryContext = React.createContext<StockCategoryContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function StockCategoryProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<StockCategoryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StockCategory | null>(null)

  return (
    <StockCategoryContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StockCategoryContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStockCategory = () => {
  const stockCategoryContext = React.useContext(StockCategoryContext)

  if (!stockCategoryContext) {
    throw new Error('useStockCategory has to be used within <StockCategoryContext>')
  }

  return stockCategoryContext
}
