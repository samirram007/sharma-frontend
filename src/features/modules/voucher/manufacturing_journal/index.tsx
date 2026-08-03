'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'
import { PosProvider } from '../contexts/pos-context'
import { ManufacturingJournalProvider } from './contexts/manufacturing_journal-context'
import Pos from './pos/index'
import type { ManufacturingJournalProps } from './pos/contracts'

const ManufacturingJournalVoucherComponent = ({
  currentRow,
}: ManufacturingJournalProps) => {
  const { setHeaderVisible } = useTransaction()

  useEffect(() => {
    setHeaderVisible?.(false)
  }, [setHeaderVisible])

  return (
    <PosProvider>
      <ManufacturingJournalProvider>
        <Pos currentRow={currentRow} />
      </ManufacturingJournalProvider>
    </PosProvider>
  )
}

export default ManufacturingJournalVoucherComponent
