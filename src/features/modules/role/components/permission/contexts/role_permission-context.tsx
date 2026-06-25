import useDialogState from '@/core/hooks/use-dialog-state'
import type { RolePermission } from '@/features/modules/permission/data/schema'
import React, { useState } from 'react'





type RolePermissionDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'permissions'

interface RolePermissionContextType {
    open: RolePermissionDialogType | null
    setOpen: (str: RolePermissionDialogType | null) => void
    currentRow: RolePermission | null
    setCurrentRow: React.Dispatch<React.SetStateAction<RolePermission | null>>
    keyName: string
}

const RolePermissionContext = React.createContext<RolePermissionContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function RolePermissionProvider({ children }: Props) {
    const [open, setOpen] = useDialogState<RolePermissionDialogType>(null)
    const [currentRow, setCurrentRow] = useState<RolePermission | null>(null)


    return (
        <RolePermissionContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "rolePermission" }}>
            {children}
        </RolePermissionContext>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRolePermission = () => {
    const rolepermissionContext = React.useContext(RolePermissionContext)

    if (!rolepermissionContext) {
        throw new Error('useRolePermission has to be used within <RolePermissionContext>')
    }

    return rolepermissionContext
}
