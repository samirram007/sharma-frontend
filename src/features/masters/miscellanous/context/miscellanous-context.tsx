import React, { useState } from 'react'





interface MiscellanousContextType {
    currentModule: string
    setCurrentModule: (str: string) => void
    sideBarOpen?: boolean
    setSideBarOpen?: (open: boolean) => void
    keyName: string
}

const MiscellanousContext = React.createContext<MiscellanousContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function MiscellanousProvider({ children }: Props) {
    const [currentModule, setCurrentModule] = useState<string>("delivery_places")
    const [sideBarOpen, setSideBarOpen] = useState<boolean>(true)



    return (
        <MiscellanousContext.Provider value={{
            currentModule,
            setCurrentModule,
            sideBarOpen,
            setSideBarOpen,
            keyName: "miscellaneous"
        }}>
            {children}
        </MiscellanousContext.Provider>
    )
}


export const useMiscellanous = () => {
    const miscellanousContext = React.useContext(MiscellanousContext)

    if (!miscellanousContext) {
        throw new Error('useMiscellanous has to be used within <MiscellanousProvider>')
    }

    return miscellanousContext
}
