import React, { createContext } from "react"


interface PosJournalEntryItemContextType {
    addItemEntryButtonRef: React.RefObject<HTMLButtonElement | null>
    addItemButtonVisible?: boolean
    setAddItemButtonVisible?: React.Dispatch<React.SetStateAction<boolean>>

}
const PosJournalEntryItemContext = createContext<PosJournalEntryItemContextType | null>(null)

export const PosJournalEntryItemProvider = ({ children }: { children: React.ReactNode }) => {
    const addItemEntryButtonRef = React.useRef<HTMLButtonElement>(null)
    const [addItemButtonVisible, setAddItemButtonVisible] = React.useState<boolean>(false)

    return (
        <PosJournalEntryItemContext
            value={{ addItemEntryButtonRef, addItemButtonVisible, setAddItemButtonVisible }}>
            {children}
        </PosJournalEntryItemContext>
    )

}


export const usePosJournalEntryItem = () => {
    const posJournalEntryItemContext = React.useContext(PosJournalEntryItemContext)

    if (!posJournalEntryItemContext) {
        throw new Error('usePosJournalEntryItem has to be used within <PosJournalEntryItemProvider>')
    }

    return posJournalEntryItemContext
}

