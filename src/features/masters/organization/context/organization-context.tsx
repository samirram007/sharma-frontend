import React, { useState } from 'react'





interface OrganizationContextType {
    currentModule: string
    setCurrentModule: (str: string) => void
    sideBarOpen?: boolean
    setSideBarOpen?: (open: boolean) => void
    keyName: string
}

const OrganizationContext = React.createContext<OrganizationContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function OrganizationProvider({ children }: Props) {
    const [currentModule, setCurrentModule] = useState<string>("company")
    const [sideBarOpen, setSideBarOpen] = useState<boolean>(true)



    return (
        <OrganizationContext.Provider value={{
            currentModule,
            setCurrentModule,
            sideBarOpen,
            setSideBarOpen,
            keyName: "organization"
        }}>
            {children}
        </OrganizationContext.Provider>
    )
}


export const useOrganization = () => {
    const organizationContext = React.useContext(OrganizationContext)

    if (!organizationContext) {
        throw new Error('useOrganization has to be used within <OrganizationProvider>')
    }

    return organizationContext
}
