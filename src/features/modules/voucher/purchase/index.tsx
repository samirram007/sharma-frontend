'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'
import { PosProvider } from '../contexts/pos-context'
import Pos from './pos/index'
import type { PurchaseProps } from './pos/contracts'

const PurchaseVoucherComponent = ({
  currentRow,
  hidePartyLedger,
}: PurchaseProps) => {
  const { setHeaderVisible } = useTransaction()

  useEffect(() => {
    setHeaderVisible?.(false)
  }, [setHeaderVisible])

  return (
    <PosProvider>
      <Pos currentRow={currentRow} hidePartyLedger={hidePartyLedger} />
    </PosProvider>
  )
}

export default PurchaseVoucherComponent
