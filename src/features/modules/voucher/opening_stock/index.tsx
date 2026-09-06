'use client'

import { useTransaction } from '@/features/transactions/context/transaction-context'
import { useEffect, useLayoutEffect } from 'react'
import { usePublishVoucherTabLabel } from '../components/use-publish-voucher-tab-label'
import { PosProvider } from '../contexts/pos-context'
import Pos from './pos/index'
import type { OpeningStockProps } from './pos/contracts'

const OpeningStockVoucherComponent = ({ currentRow }: OpeningStockProps) => {
  const { setHeaderVisible } = useTransaction()

  useEffect(() => {
    setHeaderVisible?.(false)
  }, [setHeaderVisible])

  // Show the voucher number in the tab title while editing this record.
  usePublishVoucherTabLabel(currentRow)

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
