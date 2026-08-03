'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'
import { PosProvider } from '../contexts/pos-context'
import { ConversionJournalProvider } from './contexts/conversion_journal-context'
import Pos from './pos/index'
import type { ConversionJournalProps } from './pos/contracts'

const ConversionJournalVoucherComponent = ({
  currentRow,
}: ConversionJournalProps) => {
  const { setHeaderVisible } = useTransaction()

  useEffect(() => {
    setHeaderVisible?.(false)
  }, [setHeaderVisible])

  return (
    <PosProvider>
      <ConversionJournalProvider>
        <Pos currentRow={currentRow} />
      </ConversionJournalProvider>
    </PosProvider>
  )
}

export default ConversionJournalVoucherComponent
