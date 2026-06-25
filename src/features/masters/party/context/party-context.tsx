import React, { useState } from 'react'





interface PartyContextType {
    currentModule: string
    setCurrentModule: (str: string) => void
    sideBarOpen?: boolean
    setSideBarOpen?: (open: boolean) => void
    keyName: string
}

const PartyContext = React.createContext<PartyContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function PartyProvider({ children }: Props) {
    const [currentModule, setCurrentModule] = useState<string>("supplier")
    const [sideBarOpen, setSideBarOpen] = useState<boolean>(true)



    return (
        <PartyContext.Provider value={{
            currentModule,
            setCurrentModule,
            sideBarOpen,
            setSideBarOpen,
            keyName: "party"
        }}>
            {children}
        </PartyContext.Provider>
    )
}


export const useParty = () => {
    const partyContext = React.useContext(PartyContext)

    if (!partyContext) {
        throw new Error('useParty has to be used within <PartyProvider>')
    }

    return partyContext
}
