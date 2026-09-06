'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'
import { usePublishVoucherTabLabel } from '../components/use-publish-voucher-tab-label'
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

  // Show the voucher number in the tab title while editing this record.
  usePublishVoucherTabLabel(currentRow)

  return (
    <PosProvider>
      <ManufacturingJournalProvider>
        <Pos currentRow={currentRow} />
      </ManufacturingJournalProvider>
    </PosProvider>
  )
}

export default ManufacturingJournalVoucherComponent
