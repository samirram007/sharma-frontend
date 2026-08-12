import React, { createContext } from 'react'

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
  perRowMovementType?: boolean
  setPerRowMovementType?: React.Dispatch<React.SetStateAction<boolean>>
  perGodownRowMovementType?: boolean
  setPerGodownRowMovementType?: React.Dispatch<React.SetStateAction<boolean>>
  /** Movement type forced onto the FIRST stock entry row (e.g. 'out' for the raw material in a conversion journal). */
  firstRowMovementType?: string
  setFirstRowMovementType?: React.Dispatch<React.SetStateAction<string>>
  /** Locks the first row's In/Out toggle so it can't be switched. */
  lockFirstRowMovementType?: boolean
  setLockFirstRowMovementType?: React.Dispatch<React.SetStateAction<boolean>>
}
const PosContext = createContext<PosContextType | null>(null)

export const PosProvider = ({ children }: { children: React.ReactNode }) => {
  const remarksRef = React.useRef<HTMLTextAreaElement | null>(null)
  const [saveButtonVisible, setSaveButtonVisible] =
    React.useState<boolean>(false)
  const [isRemarksDisabled, setIsRemarksDisabled] = React.useState(true)
  const [movementType, setMovementType] = React.useState<string>('')
  const [accountNature, setAccountNature] = React.useState<string>('')
  const [perRowMovementType, setPerRowMovementType] =
    React.useState<boolean>(false)
  const [perGodownRowMovementType, setPerGodownRowMovementType] =
    React.useState<boolean>(false)
  const [firstRowMovementType, setFirstRowMovementType] =
    React.useState<string>('')
  const [lockFirstRowMovementType, setLockFirstRowMovementType] =
    React.useState<boolean>(false)
  return (
    <PosContext.Provider
      value={{
        remarksRef,
        saveButtonVisible,
        setSaveButtonVisible,
        isRemarksDisabled,
        setIsRemarksDisabled,
        movementType,
        setMovementType,
        accountNature,
        setAccountNature,
        perRowMovementType,
        setPerRowMovementType,
        perGodownRowMovementType,
        setPerGodownRowMovementType,
        firstRowMovementType,
        setFirstRowMovementType,
        lockFirstRowMovementType,
        setLockFirstRowMovementType,
      }}
    >
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
