import React, { createContext } from 'react'

type ConversionJournalContextType = {
  config: { key: string; value: boolean | string | number }[]
}

const ConversionJournalContext =
  createContext<ConversionJournalContextType | null>(null)

export const ConversionJournalProvider = ({
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
  } as ConversionJournalContextType

  return (
    <ConversionJournalContext.Provider value={value}>
      {children}
    </ConversionJournalContext.Provider>
  )
}

export const useConversionJournal = () => {
  const conversionJournalContext = React.useContext(
    ConversionJournalContext,
  )

  if (!conversionJournalContext) {
    throw new Error(
      'useConversionJournal has to be used within <ConversionJournalProvider>',
    )
  }

  return conversionJournalContext
}
