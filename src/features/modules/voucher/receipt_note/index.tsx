'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'

import Pos from './pos'

import type { ReceiptNoteProps } from './pos/contracts'
import { PosProvider } from '../contexts/pos-context'
import { useFocusLastAmountOnOpen } from '../components/use-focus-last-amount-on-open'

const ReceiptNote = ({ currentRow }: ReceiptNoteProps) => {
  const { setHeaderVisible } = useTransaction()
  useEffect(() => {
    setHeaderVisible?.(false)
  }, [])

  // Land the caret on the bottom-most row's amount when an existing receipt
  // note opens for editing.
  useFocusLastAmountOnOpen(currentRow?.id)
  return (
    <>
      <PosProvider>
        <Pos currentRow={currentRow} />
      </PosProvider>
    </>
  )
}

export default ReceiptNote
