import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Ticket } from '../data/schema'

type TicketDialogType = 'add' | 'edit' | 'delete' | 'view'

interface TicketContextType {
  open: TicketDialogType | null
  setOpen: (str: TicketDialogType | null) => void
  currentRow: Ticket | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Ticket | null>>
  keyName: string
}

const TicketContext = React.createContext<TicketContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TicketProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TicketDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Ticket | null>(null)

  return (
    <TicketContext
      value={{ open, setOpen, currentRow, setCurrentRow, keyName: 'ticket' }}
    >
      {children}
    </TicketContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTicket = () => {
  const ticketContext = React.useContext(TicketContext)

  if (!ticketContext) {
    throw new Error('useTicket has to be used within <TicketContext>')
  }

  return ticketContext
}
