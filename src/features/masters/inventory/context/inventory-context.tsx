import React, { useState } from 'react'





interface InventoryContextType {
    currentModule: string
    setCurrentModule: (str: string) => void
    sideBarOpen?: boolean
    setSideBarOpen?: (open: boolean) => void
    keyName: string
}

const InventoryContext = React.createContext<InventoryContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function InventoryProvider({ children }: Props) {
    const [currentModule, setCurrentModule] = useState<string>("stock_item")
    const [sideBarOpen, setSideBarOpen] = useState<boolean>(true)



    return (
        <InventoryContext.Provider value={{
            currentModule,
            setCurrentModule,
            sideBarOpen,
            setSideBarOpen,
            keyName: "inventory"
        }}>
            {children}
        </InventoryContext.Provider>
    )
}


export const useInventory = () => {
    const inventoryContext = React.useContext(InventoryContext)

    if (!inventoryContext) {
        throw new Error('useInventory has to be used within <InventoryProvider>')
    }

    return inventoryContext
}
