import React from 'react'
import type { FreightSchema } from '../../data/schema'

type FreightReceiptDialogType = 'invite' | 'add' | 'edit' | 'delete'
interface FreightReceiptContextType {
  open: FreightReceiptDialogType | null
  setOpen: (str: FreightReceiptDialogType | null) => void
  currentRow: FreightSchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<FreightSchema | null>>
  totalReceipts: number
  setTotalReceipts: React.Dispatch<React.SetStateAction<number>>
  freightAmount: number
  setFreightAmount: React.Dispatch<React.SetStateAction<number>>
  keyName: string
  config: Array<{ key: string; value: boolean | string | number }>
}

const FreightReceiptContext =
  React.createContext<FreightReceiptContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function FreightReceiptProvider({ children }: Props) {
  const [open, setOpen] = React.useState<FreightReceiptDialogType | null>(null)
  const [currentRow, setCurrentRow] = React.useState<FreightSchema | null>(null)
  const [totalReceipts, setTotalReceipts] = React.useState(0)
  const [freightAmount, setFreightAmount] = React.useState(0)
  const keyName = 'freightReceipt'
  const config = [
    { key: 'show', value: true },
    { key: 'showAdd', value: true },
    { key: 'showEdit', value: true },
    { key: 'showDelete', value: true },
    { key: 'showInvite', value: true },
    { key: 'showExport', value: true },
    { key: 'showImport', value: true },
    { key: 'showPrint', value: true },
    { key: 'showView', value: true },
  ]

  return (
    <FreightReceiptContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        keyName,
        config,
        totalReceipts,
        setTotalReceipts,
        freightAmount,
        setFreightAmount,
      }}
    >
      {children}
    </FreightReceiptContext.Provider>
  )
}

export const useFreightReceiptContext = () => {
  const context = React.useContext(FreightReceiptContext)
  if (!context)
    throw new Error(
      'FreightReceiptContext must be used within a FreightReceiptProvider',
    )
  return context
}
