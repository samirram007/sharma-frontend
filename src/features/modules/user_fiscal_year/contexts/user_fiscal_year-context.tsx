import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { UserFiscalYear } from '../data/schema'



type UserFiscalYearDialogType = 'add' | 'edit' | 'delete'

interface UserFiscalYearContextType {
    open: UserFiscalYearDialogType | null
    setOpen: (str: UserFiscalYearDialogType | null) => void
    currentRow: UserFiscalYear | null
    setCurrentRow: React.Dispatch<React.SetStateAction<UserFiscalYear | null>>
    keyName: string
}

const UserFiscalYearContext = React.createContext<UserFiscalYearContextType | null>(null)
interface Props {
    children: React.ReactNode
}

export default function UserFiscalYearProvider({ children }: Props) {
    const [open, setOpen] = useDialogState<UserFiscalYearDialogType>(null)
    const [currentRow, setCurrentRow] = useState<UserFiscalYear | null>(null)


    return (
        <UserFiscalYearContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "user" }}>
            {children}
        </UserFiscalYearContext>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUserFiscalYear = () => {
    const userFiscalYearContext = React.useContext(UserFiscalYearContext)

    if (!userFiscalYearContext) {
        throw new Error('useUserFiscalYear has to be used within <UserFiscalYearContext>')
    }

    return userFiscalYearContext
}
