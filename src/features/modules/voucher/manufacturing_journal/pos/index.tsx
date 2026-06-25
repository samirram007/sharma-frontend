import { useEffect } from 'react'
import PurchaseVoucherComponent from '@/features/modules/voucher/purchase'
import type { ManufacturingJournalProps } from './contracts'

const Pos = ({ currentRow }: ManufacturingJournalProps) => {
    useEffect(() => {
        console.log('Manufacturing Journal POS initialized')
    }, [])

    return (
        <div className='w-full h-full p-4'>
            <p className='text-xs text-slate-500'>Voucher Type ID: 2006</p>
            <h2 className='text-lg font-semibold text-slate-800 mb-4'>Manufacturing Journal Entry</h2>
            {/* Item entries: consume raw materials ↓, produce finished goods ↑ */}
            <PurchaseVoucherComponent currentRow={currentRow as any} hidePartyLedger />
        </div>
    )
}

export default Pos
