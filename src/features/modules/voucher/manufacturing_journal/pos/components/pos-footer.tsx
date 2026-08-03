import { Button } from '@/components/ui/button'
import { useFocusArea } from '@/core/hooks/useFocusArea'
import { useRef, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import type { ManufacturingJournalVoucherForm } from '../../data/schema'
import NarrationBox from './special/narration-box'
import SaveDialog from './special/save-dialog'

type PosFooterProps = {
  mainForm: UseFormReturn<ManufacturingJournalVoucherForm>
}

const PosFooter = ({ mainForm }: PosFooterProps) => {
  const footerRef = useRef<HTMLDivElement>(null)
  const [isSaving, setSaving] = useState(false)

  useFocusArea(footerRef as React.RefObject<HTMLElement>)
  const { watch } = mainForm

  const entries = watch('stockJournal.stockJournalEntries') ?? []

  const totals = entries.reduce(
    (acc, entry) => {
      const amount = Number(entry?.amount) || 0
      if (entry?.movementType === 'out') {
        acc.consumption += amount
      } else {
        acc.production += amount
      }
      acc.grandTotal += amount
      return acc
    },
    { consumption: 0, production: 0, grandTotal: 0 },
  )

  return (
    <div
      ref={footerRef}
      className="bg-yellow-600/20 grid grid-cols-[1fr_1fr] px-8"
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
        <div className="grid grid-cols-[170px_160px_160px_140px] pt-2 text-right font-bold">
          <div className="text-orange-700 text-left">
            Out: {totals.consumption ? totals.consumption.toFixed(2) : 0}
          </div>
          <div className="text-emerald-700 text-left">
            In: {totals.production ? totals.production.toFixed(2) : 0}
          </div>
          <div className="text-slate-700 text-left">
            Total: {totals.grandTotal ? totals.grandTotal.toFixed(2) : 0}
          </div>
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
