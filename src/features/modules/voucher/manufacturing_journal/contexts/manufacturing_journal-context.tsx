import React, { createContext } from 'react'

type ManufacturingJournalContextType = {
  config: { key: string; value: boolean | string | number }[]
}

const ManufacturingJournalContext =
  createContext<ManufacturingJournalContextType | null>(null)

export const ManufacturingJournalProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const config = [
    { key: 'show_actual_and_billing_quantity', value: true },
    { key: 'movement_per_line', value: true },
    { key: 'requires_party_ledger', value: false },
    { key: 'requires_transaction_ledger', value: false },
  ]
  const value = {
    config,
  } as ManufacturingJournalContextType

  return (
    <ManufacturingJournalContext.Provider value={value}>
      {children}
    </ManufacturingJournalContext.Provider>
  )
}

export const useManufacturingJournal = () => {
  const manufacturingJournalContext = React.useContext(
    ManufacturingJournalContext,
  )

  if (!manufacturingJournalContext) {
    throw new Error(
      'useManufacturingJournal has to be used within <ManufacturingJournalProvider>',
    )
  }

  return manufacturingJournalContext
}
