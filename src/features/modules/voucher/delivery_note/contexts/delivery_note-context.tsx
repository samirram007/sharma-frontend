import React, { createContext } from "react"


type DeliveryNoteContextType = {

    config: { key: string, value: boolean }[]
}


const DeliveryNoteContext = createContext<DeliveryNoteContextType | null>(null)

export const DeliveryNoteProvider = ({ children }: { children: React.ReactNode }) => {


    const config = [
        { key: 'order_details', value: false },
        { key: 'receipt_details', value: true },
        { key: 'freight_details', value: true },
        { key: 'freight_method', value: 2 },
    ]
    const value = {
        config
    } as DeliveryNoteContextType



    return <DeliveryNoteContext.Provider value={value}>
        {children}
    </DeliveryNoteContext.Provider>
}

export const useDeliveryNote = () => {
    const deliveryNoteContext = React.useContext(DeliveryNoteContext)

    if (!deliveryNoteContext) {
        throw new Error('useDeliveryNote has to be used within <DeliveryNoteContext>')
    }

    return deliveryNoteContext
}
