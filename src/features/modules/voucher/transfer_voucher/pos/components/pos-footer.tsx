import { Button } from '@/components/ui/button'
import { useFocusArea } from '@/core/hooks/useFocusArea'
import { useRef, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import type { TransferVoucherVoucherForm } from '../../data/schema'
import NarrationBox from './special/narration-box'
import SaveDialog from './special/save-dialog'

type PosFooterProps = {
  mainForm: UseFormReturn<TransferVoucherVoucherForm>
}

const PosFooter = ({ mainForm }: PosFooterProps) => {
  const footerRef = useRef<HTMLDivElement>(null)
  const [isSaving, setSaving] = useState(false)

  useFocusArea(footerRef as React.RefObject<HTMLElement>)
  const { watch } = mainForm

  const entries = watch('stockJournal.stockJournalEntries') ?? []

  const totals = entries.reduce(
    (acc, entry) => {
      const godownRows = entry?.stockJournalGodownEntries ?? []
      godownRows.forEach((g) => {
        const qty = Number(g?.billingQuantity) || 0
        const amount = Number(g?.amount) || 0
        if (g?.movementType === 'out') {
          acc.outQuantity += qty
          acc.outAmount += amount
        } else {
          acc.inQuantity += qty
          acc.inAmount += amount
        }
      })
      return acc
    },
    { outQuantity: 0, inQuantity: 0, outAmount: 0, inAmount: 0 },
  )

  const balanced =
    totals.outQuantity > 0 &&
    Math.abs(totals.outQuantity - totals.inQuantity) < 0.0001

  return (
    <div
      ref={footerRef}
      className="bg-cyan-700/20 grid grid-cols-[1fr_1fr] px-8"
    >
      <div className="grid">
        <NarrationBox
          type="textarea"
          form={mainForm}
          gapClass={''}
          className="text-gray-200 "
          isSaving={isSaving}
          setSaving={setSaving}
          name="remarks"
        />
      </div>
      <div className="grid grid-rows-[1fr_1fr] items-start justify-end">
        <div className="grid grid-cols-[130px_120px_130px_120px_120px] pt-2 text-right font-bold items-center">
          <div className="text-orange-700 text-left">
            Out: {totals.outQuantity ? totals.outQuantity.toFixed(2) : 0}
          </div>
          <div className="text-emerald-700 text-left">
            In: {totals.inQuantity ? totals.inQuantity.toFixed(2) : 0}
          </div>
          <div
            className={`rounded px-2 py-0.5 text-xs font-semibold ${
              balanced
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {balanced ? 'Balanced' : 'Out ≠ In'}
          </div>
          <div></div>
          <div></div>
        </div>

        <div className="text-left pl-2">
          {isSaving ? (
            <SaveDialog
              mainForm={mainForm}
              isSaving={isSaving}
              setSaving={setSaving}
            />
          ) : (
            <Button
              type="button"
              variant="default"
              className="h-8 w-full focus:bg-black focus:text-white"
              size="lg"
              disabled={isSaving}
              onClick={() => setSaving(true)}
            >
              Save....
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PosFooter
