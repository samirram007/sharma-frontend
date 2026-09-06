'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'
import { usePublishVoucherTabLabel } from '../components/use-publish-voucher-tab-label'
import { PosProvider } from '../contexts/pos-context'
import Pos from './pos/index'
import type { DebitNoteProps } from './pos/contracts'

const DebitNoteVoucherComponent = ({ currentRow }: DebitNoteProps) => {
  const { setHeaderVisible } = useTransaction()

  useEffect(() => {
    setHeaderVisible?.(false)
  }, [setHeaderVisible])

  // Show the voucher number in the tab title while editing this record.
  usePublishVoucherTabLabel(currentRow)

  return (
    <PosProvider>
      <Pos currentRow={currentRow} />
    </PosProvider>
  )
}

export default DebitNoteVoucherComponent
