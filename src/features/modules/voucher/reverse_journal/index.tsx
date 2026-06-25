'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'
import { PosProvider } from '../contexts/pos-context'
import type { ReverseJournalProps } from './pos/contracts'
import Pos from './pos/index'

const ReverseJournalVoucherComponent = ({ currentRow }: ReverseJournalProps) => {
    const { setHeaderVisible } = useTransaction()

    useEffect(() => {
        setHeaderVisible?.(false)
    }, [setHeaderVisible])

    return (
        <PosProvider>
            <Pos currentRow={currentRow} />
        </PosProvider>
    )
}

export default ReverseJournalVoucherComponent
