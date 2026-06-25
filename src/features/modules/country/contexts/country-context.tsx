import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { Country } from '../data/schema'



type CountryDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface CountryContextType {
  open: CountryDialogType | null
  setOpen: (str: CountryDialogType | null) => void
  currentRow: Country | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Country | null>>
  keyName: string
}

const CountryContext = React.createContext<CountryContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function CountryProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<CountryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Country | null>(null)


  return (
    <CountryContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "account_nature" }}>
      {children}
    </CountryContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCountry = () => {
  const countryContext = React.useContext(CountryContext)

  if (!countryContext) {
    throw new Error('useCountry has to be used within <CountryContext>')
  }

  return countryContext
}
