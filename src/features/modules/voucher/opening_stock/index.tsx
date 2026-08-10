'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect, useLayoutEffect } from 'react'
import { PosProvider } from '../contexts/pos-context'
import Pos from './pos/index'
import type { OpeningStockProps } from './pos/contracts'

const OpeningStockVoucherComponent = ({ currentRow }: OpeningStockProps) => {
  const { setHeaderVisible } = useTransaction()

  useEffect(() => {
    setHeaderVisible?.(false)
  }, [setHeaderVisible])

  // This screen is a full-height entry form — hide the layout's placeholder
  // footer (blue "Footer / Home" bar) so the voucher fills the whole viewport.
  // useLayoutEffect so the footer never flashes on first paint.
  useLayoutEffect(() => {
    document.body.classList.add('hide-layout-footer')
    return () => document.body.classList.remove('hide-layout-footer')
  }, [])

  return (
    <PosProvider>
      <Pos currentRow={currentRow} />
    </PosProvider>
  )
}

export default OpeningStockVoucherComponent
