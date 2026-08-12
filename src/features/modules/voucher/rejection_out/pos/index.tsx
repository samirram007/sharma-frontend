import { useEffect } from 'react'
import PurchaseVoucherComponent from '@/features/modules/voucher/purchase'
import type { RejectionOutProps } from './contracts'

const Pos = ({ currentRow }: RejectionOutProps) => {
  useEffect(() => {
    console.log('Rejection Out POS initialized')
  }, [])

  return (
    <div className="w-full h-full p-4">
      <p className="text-xs text-slate-500">Voucher Type ID: 2004</p>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Rejection Out Entry
      </h2>
      {/* Using Purchase component as base implementation - inventory items */}
      <PurchaseVoucherComponent currentRow={currentRow as any} />
    </div>
  )
}

export default Pos
