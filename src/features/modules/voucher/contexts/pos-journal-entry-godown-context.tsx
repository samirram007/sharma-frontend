import React, { createContext } from "react"


interface PosJournalEntryGodownContextType {
    addGodownEntryButtonRef: React.RefObject<HTMLButtonElement | null>
    addGodownButtonVisible?: boolean
    setAddGodownButtonVisible?: React.Dispatch<React.SetStateAction<boolean>>

}
const PosJournalEntryGodownContext = createContext<PosJournalEntryGodownContextType | null>(null)

export const PosJournalEntryGodownProvider = ({ children }: { children: React.ReactNode }) => {
    const addGodownEntryButtonRef = React.useRef<HTMLButtonElement>(null)
    const [addGodownButtonVisible, setAddGodownButtonVisible] = React.useState<boolean>(false)

    return (
        <PosJournalEntryGodownContext
            value={{ addGodownEntryButtonRef, addGodownButtonVisible, setAddGodownButtonVisible }}>
            {children}
        </PosJournalEntryGodownContext>
    )

}


export const usePosJournalEntryGodown = () => {
    const posJournalEntryGodownContext = React.useContext(PosJournalEntryGodownContext)

    if (!posJournalEntryGodownContext) {
        throw new Error('usePosJournalEntryGodown has to be used within <PosJournalEntryGodownProvider>')
    }

    return posJournalEntryGodownContext
}

