import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Status } from '../data/schema'

type StatusDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface StatusContextType {
  open: StatusDialogType | null
  setOpen: (str: StatusDialogType | null) => void
  currentRow: Status | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Status | null>>
  keyName: string
}

const StatusContext = React.createContext<StatusContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function StatusProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<StatusDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Status | null>(null)

  return (
    <StatusContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "status" }}>
      {children}
    </StatusContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStatus = () => {
  const statusContext = React.useContext(StatusContext)

  if (!statusContext) {
    throw new Error('useStatus has to be used within <StatusContext>')
  }

  return statusContext
}
