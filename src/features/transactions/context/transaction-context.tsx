import React, { useState } from 'react'





interface TransactionContextType {
    currentModule: string
    setCurrentModule: (str: string) => void
    sideBarOpen?: boolean
    setSideBarOpen?: (open: boolean) => void
    headerVisible?: boolean
    setHeaderVisible?: (visible: boolean) => void
    keyName: string
    config: { key: string; value: boolean }[]
}

const TransactionContext = React.createContext<TransactionContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function TransactionProvider({ children }: Props) {
    const [currentModule, setCurrentModule] = useState<string>("user")
    const [sideBarOpen, setSideBarOpen] = useState<boolean>(true)
    const [headerVisible, setHeaderVisible] = useState<boolean>(false)
    const config = [
        { key: 'show_actual_and_billing_quantity', value: false },
        { key: 'show_alternate_unit', value: false },
    ]



    return (
        <TransactionContext.Provider value={{
            currentModule,
            setCurrentModule,
            sideBarOpen,
            setSideBarOpen,
            headerVisible,
            setHeaderVisible,
            config,
            keyName: "transaction"
        }}>
            {children}
        </TransactionContext.Provider>
    )
}


export const useTransaction = () => {
    const transactionContext = React.useContext(TransactionContext)

    if (!transactionContext) {
        throw new Error('useTransaction has to be used within <TransactionProvider>')
    }

    return transactionContext
}
