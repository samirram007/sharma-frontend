import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Role } from '../data/schema'



type RoleDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'permissions'

interface RoleContextType {
  open: RoleDialogType | null
  setOpen: (str: RoleDialogType | null) => void
  currentRow: Role | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Role | null>>
  keyName: string
  isModal?: boolean
  setIsModal?: React.Dispatch<React.SetStateAction<boolean>>
}

const RoleContext = React.createContext<RoleContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function RoleProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<RoleDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Role | null>(null)
  const [isModal, setIsModal] = useState<boolean>(false)



  return (
    <RoleContext.Provider value={{
      open, setOpen, currentRow, setCurrentRow, keyName: "role",
      isModal, setIsModal
    }}>
      {children}
    </RoleContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRole = () => {
  const roleContext = React.useContext(RoleContext)

  if (!roleContext) {
    throw new Error('useRole has to be used within <RoleContext>')
  }

  return roleContext
}
