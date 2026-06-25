'use client'


import { useTransaction } from '@/features/transactions/context/transaction-context';
import { useEffect } from 'react';

import Pos from './pos';
import { PosProvider } from '../contexts/pos-context';
import type { DeliveryNoteProps } from './pos/contracts';
import { DeliveryNoteProvider } from './contexts/delivery_note-context';







const DeliveryNote = ({ currentRow }: DeliveryNoteProps) => {
    const { setHeaderVisible } = useTransaction()
    useEffect(() => {
        setHeaderVisible?.(false)
    }, [])
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
