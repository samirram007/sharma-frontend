'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect } from 'react'
import { PosProvider } from '../contexts/pos-context'
import Pos from './pos/index'
import type { PhysicalStockProps } from './pos/contracts'

const PhysicalStockVoucherComponent = ({ currentRow }: PhysicalStockProps) => {
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

export default PhysicalStockVoucherComponent
