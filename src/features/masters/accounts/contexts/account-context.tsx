import React, { useState } from 'react'





interface AccountContextType {
    currentModule: string
    setCurrentModule: (str: string) => void
    sideBarOpen?: boolean
    setSideBarOpen?: (open: boolean) => void
    keyName: string
}

const AccountContext = React.createContext<AccountContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function AccountProvider({ children }: Props) {
    const [currentModule, setCurrentModule] = useState<string>("stock_item")
    const [sideBarOpen, setSideBarOpen] = useState<boolean>(true)



    return (
        <AccountContext.Provider value={{
            currentModule,
            setCurrentModule,
            sideBarOpen,
            setSideBarOpen,
            keyName: "account"
        }}>
            {children}
        </AccountContext.Provider>
    )
}


export const useAccount = () => {
    const accountContext = React.useContext(AccountContext)

    if (!accountContext) {
        throw new Error('useAccount has to be used within <AccountProvider>')
    }

    return accountContext
}
