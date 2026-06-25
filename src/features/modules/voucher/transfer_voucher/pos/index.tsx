import { useEffect } from 'react'
import PurchaseVoucherComponent from '@/features/modules/voucher/purchase'
import type { TransferVoucherProps } from './contracts'

const Pos = ({ currentRow }: TransferVoucherProps) => {
    useEffect(() => {
        console.log('Transfer Voucher POS initialized')
    }, [])

    return (
        <div className='w-full h-full p-4'>
            <p className='text-xs text-slate-500'>Voucher Type ID: 2005</p>
            <h2 className='text-lg font-semibold text-slate-800 mb-4'>Transfer Voucher Entry</h2>
            {/* Using Purchase component as base implementation - inventory items */}
            <PurchaseVoucherComponent currentRow={currentRow as any} />
        </div>
    )
}

export default Pos
