import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { User } from '../data/schema'



type UserDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface UserContextType {
  open: UserDialogType | null
  setOpen: (str: UserDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  keyName: string
}

const UserContext = React.createContext<UserContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UserProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UserDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)


  return (
    <UserContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "user" }}>
      {children}
    </UserContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const userContext = React.useContext(UserContext)

  if (!userContext) {
    throw new Error('useUser has to be used within <UserContext>')
  }

  return userContext
}
