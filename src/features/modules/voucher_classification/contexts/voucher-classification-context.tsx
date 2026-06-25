import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { VoucherClassification } from '../data/schema'



type VoucherClassificationDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface VoucherClassificationContextType {
  open: VoucherClassificationDialogType | null
  setOpen: (str: VoucherClassificationDialogType | null) => void
  currentRow: VoucherClassification | null
  setCurrentRow: React.Dispatch<React.SetStateAction<VoucherClassification | null>>
}

const VoucherClassificationContext = React.createContext<VoucherClassificationContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function VoucherClassificationProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<VoucherClassificationDialogType>(null)
  const [currentRow, setCurrentRow] = useState<VoucherClassification | null>(null)

  return (
    <VoucherClassificationContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </VoucherClassificationContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVoucherClassification = () => {
  const voucherClassificationContext = React.useContext(VoucherClassificationContext)

  if (!voucherClassificationContext) {
    throw new Error('useVoucherClassification has to be used within <VoucherClassificationContext>')
  }

  return voucherClassificationContext
}
