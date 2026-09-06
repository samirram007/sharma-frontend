'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'
import { usePublishVoucherTabLabel } from '../components/use-publish-voucher-tab-label'
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

  // Show the voucher number in the tab title while editing this record.
  usePublishVoucherTabLabel(currentRow)

  return (
    <PosProvider>
      <ConversionJournalProvider>
        <Pos currentRow={currentRow} />
      </ConversionJournalProvider>
    </PosProvider>
  )
}

export default ConversionJournalVoucherComponent
