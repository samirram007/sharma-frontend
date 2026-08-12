import { useEffect } from 'react'
import SalesVoucherComponent from '@/features/modules/voucher/sales'
import type { CreditNoteProps } from './contracts'

const Pos = ({ currentRow }: CreditNoteProps) => {
  useEffect(() => {
    console.log('Credit Note POS initialized')
  }, [])

  return (
    <div className="w-full h-full p-4">
      <p className="text-xs text-slate-500">Voucher Type ID: 1008</p>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Credit Note Entry
      </h2>
      {/* Using Sales component as base implementation - can be customized later */}
      <SalesVoucherComponent currentRow={currentRow as any} />
    </div>
  )
}

export default Pos
