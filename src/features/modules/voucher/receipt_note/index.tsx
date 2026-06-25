'use client'


import { useTransaction } from '@/features/transactions/context/transaction-context';
import { useEffect } from 'react';

import Pos from './pos';

import type { ReceiptNoteProps } from './pos/contracts';
import { PosProvider } from '../contexts/pos-context';




const ReceiptNote = ({ currentRow }: ReceiptNoteProps) => {
    const { setHeaderVisible } = useTransaction()
    useEffect(() => {
        setHeaderVisible?.(false)
    }, [])
    return (

        <>
            <PosProvider>
                <Pos currentRow={currentRow} />
            </PosProvider>

        </>
    )
}

export default ReceiptNote
