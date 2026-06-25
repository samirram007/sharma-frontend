'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'
import { PosProvider } from '../contexts/pos-context'
import Pos from './pos/index'
import type { SalesOrderProps } from './pos/contracts'

const SalesOrderVoucherComponent = ({ currentRow }: SalesOrderProps) => {
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

export default SalesOrderVoucherComponent
