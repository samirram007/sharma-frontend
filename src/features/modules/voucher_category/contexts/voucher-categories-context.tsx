import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { VoucherCategory } from '../data/schema'



type VoucherCategoryDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface VoucherCategoryContextType {
  open: VoucherCategoryDialogType | null
  setOpen: (str: VoucherCategoryDialogType | null) => void
  currentRow: VoucherCategory | null
  setCurrentRow: React.Dispatch<React.SetStateAction<VoucherCategory | null>>
}

const VoucherCategoryContext = React.createContext<VoucherCategoryContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function VoucherCategoryProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<VoucherCategoryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<VoucherCategory | null>(null)

  return (
    <VoucherCategoryContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </VoucherCategoryContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVoucherCategory = () => {
  const voucherCategoryContext = React.useContext(VoucherCategoryContext)

  if (!voucherCategoryContext) {
    throw new Error('useVoucherCategory has to be used within <VoucherCategoryContext>')
  }

  return voucherCategoryContext
}
