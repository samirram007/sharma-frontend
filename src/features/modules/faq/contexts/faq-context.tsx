import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Faq } from '../data/schema'

type FaqDialogType = 'add' | 'edit' | 'delete'

interface FaqContextType {
  open: FaqDialogType | null
  setOpen: (str: FaqDialogType | null) => void
  currentRow: Faq | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Faq | null>>
  keyName: string
}

const FaqContext = React.createContext<FaqContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function FaqProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<FaqDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Faq | null>(null)

  return (
    <FaqContext
      value={{ open, setOpen, currentRow, setCurrentRow, keyName: 'faq' }}
    >
      {children}
    </FaqContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFaq = () => {
  const faqContext = React.useContext(FaqContext)

  if (!faqContext) {
    throw new Error('useFaq has to be used within <FaqContext>')
  }

  return faqContext
}
