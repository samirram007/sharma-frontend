import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { ReceiptSchema } from '../data/schema'




type ReceiptDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface ReceiptContextType {
  open: ReceiptDialogType | null
  setOpen: (str: ReceiptDialogType | null) => void
  currentRow: ReceiptSchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ReceiptSchema | null>>
  keyName: string
}

const ReceiptContext = React.createContext<ReceiptContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ReceiptProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ReceiptDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ReceiptSchema | null>(null)

  return (
    <ReceiptContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "day_books" }}>
      {children}
    </ReceiptContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useReceipt = () => {
  const receiptContext = React.useContext(ReceiptContext)

  if (!receiptContext) {
    throw new Error('useReceipt has to be used within <ReceiptContext>')
  }

  return receiptContext
}
