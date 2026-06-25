import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { VoucherType } from '../data/schema'



type VoucherTypeDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface VoucherTypeContextType {
  open: VoucherTypeDialogType | null
  setOpen: (str: VoucherTypeDialogType | null) => void
  currentRow: VoucherType | null
  setCurrentRow: React.Dispatch<React.SetStateAction<VoucherType | null>>
}

const VoucherTypeContext = React.createContext<VoucherTypeContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function VoucherTypeProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<VoucherTypeDialogType>(null)
  const [currentRow, setCurrentRow] = useState<VoucherType | null>(null)

  return (
    <VoucherTypeContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </VoucherTypeContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVoucherType = () => {
  const voucherTypeContext = React.useContext(VoucherTypeContext)

  if (!voucherTypeContext) {
    throw new Error('useVoucherType has to be used within <VoucherTypeContext>')
  }

  return voucherTypeContext
}
