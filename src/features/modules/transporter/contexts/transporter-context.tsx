import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Transporter } from '../data/schema'



type TransporterDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface TransporterContextType {
  open: TransporterDialogType | null
  setOpen: (str: TransporterDialogType | null) => void
  currentRow: Transporter | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Transporter | null>>
  keyName: string
}

const TransporterContext = React.createContext<TransporterContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TransporterProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TransporterDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Transporter | null>(null)


  return (
    <TransporterContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "transporter" }}>
      {children}
    </TransporterContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTransporter = () => {
  const transporterContext = React.useContext(TransporterContext)
  //console.log('well I am here', transporterContext?.open)
  if (!transporterContext) {
    throw new Error('useTransporter has to be used within <TransporterContext>')
  }

  return transporterContext
}
