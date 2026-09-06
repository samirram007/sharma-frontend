'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'

import Pos from './pos'
import { PosProvider } from '../contexts/pos-context'
import type { DeliveryNoteProps } from './pos/contracts'
import { DeliveryNoteProvider } from './contexts/delivery_note-context'
import { useFocusLastAmountOnOpen } from '../components/use-focus-last-amount-on-open'

const DeliveryNote = ({ currentRow }: DeliveryNoteProps) => {
  const { setHeaderVisible } = useTransaction()
  useEffect(() => {
    setHeaderVisible?.(false)
  }, [])

  // Land the caret on the bottom-most row's amount when an existing delivery
  // note opens for editing.
  useFocusLastAmountOnOpen(currentRow?.id)
  return (
    <>
      <PosProvider>
        <DeliveryNoteProvider>
          <>
            <Pos currentRow={currentRow} />
          </>
        </DeliveryNoteProvider>
      </PosProvider>
    </>
  )
}

export default DeliveryNote
