import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Permission } from '../data/schema'



type PermissionDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface PermissionContextType {
  open: PermissionDialogType | null
  setOpen: (str: PermissionDialogType | null) => void
  currentRow: Permission | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Permission | null>>
  keyName: string
}

const PermissionContext = React.createContext<PermissionContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function PermissionProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<PermissionDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Permission | null>(null)


  return (
    <PermissionContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "permission" }}>
      {children}
    </PermissionContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePermission = () => {
  const permissionContext = React.useContext(PermissionContext)

  if (!permissionContext) {
    throw new Error('usePermission has to be used within <PermissionContext>')
  }

  return permissionContext
}
