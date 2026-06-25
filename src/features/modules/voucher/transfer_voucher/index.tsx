'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'
import { PosProvider } from '../contexts/pos-context'
import Pos from './pos/index'
import type { TransferVoucherProps } from './pos/contracts'

const TransferVoucherVoucherComponent = ({ currentRow }: TransferVoucherProps) => {
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

export default TransferVoucherVoucherComponent
