import { useEffect } from 'react'
import PurchaseVoucherComponent from '@/features/modules/voucher/purchase'
import type { DebitNoteProps } from './contracts'

const Pos = ({ currentRow }: DebitNoteProps) => {
  useEffect(() => {
    console.log('Debit Note POS initialized')
  }, [])

  return (
    <div className="w-full h-full p-4">
      <p className="text-xs text-slate-500">Voucher Type ID: 1007</p>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Debit Note Entry
      </h2>
      {/* Supplier-side return: reduces payable, reduces stock for returned items */}
      <PurchaseVoucherComponent currentRow={currentRow as any} />
    </div>
  )
}

export default Pos
