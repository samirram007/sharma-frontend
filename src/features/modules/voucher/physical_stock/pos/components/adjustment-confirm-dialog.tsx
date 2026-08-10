'use client'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { buildVarianceLines } from '../utils/count-math'

import type { PhysicalStockCountItem } from '../../data/schema'
import VarianceSummaryTable from './variance-summary-table'

type AdjustmentConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: Array<PhysicalStockCountItem | null | undefined>
  busy: 'save' | 'populate' | 'verify' | 'adjust' | null
  onConfirm: () => void
}

const AdjustmentConfirmDialog = ({
  open,
  onOpenChange,
  items,
  busy,
  onConfirm,
}: AdjustmentConfirmDialogProps) => {
  const lines = buildVarianceLines(items)
  const hasZeroRate = lines.some((line) => line.rate <= 0)

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Generate Stock Adjustment?"
      desc={
        lines.length > 0
          ? `A SKADJ voucher will be created with the variance lines below. Loss lines issue stock (OUT) and surplus lines receive stock (IN).${
              hasZeroRate
                ? ' Lines without a rate will be valued at the item’s standard cost.'
                : ''
            }`
          : 'No variances found on this count sheet, so no adjustment is needed.'
      }
      confirmText="Generate Adjustment"
      isLoading={busy === 'adjust'}
      disabled={lines.length === 0}
      handleConfirm={onConfirm}
      className="max-w-2xl"
    >
      <div className="max-h-[50vh] overflow-y-auto">
        <VarianceSummaryTable items={items} />
      </div>
    </ConfirmDialog>
  )
}

export default AdjustmentConfirmDialog
