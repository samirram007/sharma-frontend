import React, { createContext } from 'react'

type TransferVoucherContextType = {
  config: { key: string; value: boolean | string | number }[]
}

const TransferVoucherContext = createContext<TransferVoucherContextType | null>(
  null,
)

export const TransferVoucherProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const config = [
    { key: 'show_actual_and_billing_quantity', value: true },
    { key: 'movement_per_godown_row', value: true },
    { key: 'requires_party_ledger', value: false },
    { key: 'requires_transaction_ledger', value: false },
  ]
  const value = {
    config,
  } as TransferVoucherContextType

  return (
    <TransferVoucherContext.Provider value={value}>
      {children}
    </TransferVoucherContext.Provider>
  )
}

export const useTransferVoucher = () => {
  const transferVoucherContext = React.useContext(TransferVoucherContext)

  if (!transferVoucherContext) {
    throw new Error(
      'useTransferVoucher has to be used within <TransferVoucherProvider>',
    )
  }

  return transferVoucherContext
}
