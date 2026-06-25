import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { State } from '../data/schema'



type StateDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface StateContextType {
  open: StateDialogType | null
  setOpen: (str: StateDialogType | null) => void
  currentRow: State | null
  setCurrentRow: React.Dispatch<React.SetStateAction<State | null>>
  keyName: string
}

const StateContext = React.createContext<StateContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function StateProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<StateDialogType>(null)
  const [currentRow, setCurrentRow] = useState<State | null>(null)


  return (
    <StateContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "state" }}>
      {children}
    </StateContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStateRegion = () => {
  const stateContext = React.useContext(StateContext)

  if (!stateContext) {
    throw new Error('useStateRegion has to be used within <StateContext>')
  }

  return stateContext
}
