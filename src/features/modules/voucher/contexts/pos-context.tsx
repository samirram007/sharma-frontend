import React, { createContext } from "react"


interface PosContextType {

    remarksRef: React.RefObject<HTMLTextAreaElement | null>
    saveButtonVisible?: boolean
    setSaveButtonVisible?: React.Dispatch<React.SetStateAction<boolean>>
    isRemarksDisabled?: boolean
    setIsRemarksDisabled?: React.Dispatch<React.SetStateAction<boolean>>
    movementType?: string
    setMovementType?: React.Dispatch<React.SetStateAction<string>>
    accountNature?: string
    setAccountNature?: React.Dispatch<React.SetStateAction<string>>

}
const PosContext = createContext<PosContextType | null>(null)

export const PosProvider = ({ children }: { children: React.ReactNode }) => {

    const remarksRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [saveButtonVisible, setSaveButtonVisible] = React.useState<boolean>(false)
    const [isRemarksDisabled, setIsRemarksDisabled] = React.useState(true);
    const [movementType, setMovementType] = React.useState<string>("");
    const [accountNature, setAccountNature] = React.useState<string>("");
    return (
        <PosContext.Provider
            value={{
                remarksRef,
                saveButtonVisible, setSaveButtonVisible,
                isRemarksDisabled, setIsRemarksDisabled,
                movementType, setMovementType,
                accountNature, setAccountNature
            }}>
            {children}
        </PosContext.Provider>
    )

}


export const usePos = () => {
    const posContext = React.useContext(PosContext)

    if (!posContext) {
        throw new Error('usePos has to be used within <PosProvider>')
    }

    return posContext
}

