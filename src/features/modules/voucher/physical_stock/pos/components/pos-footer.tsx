import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'

import type {
  PhysicalStockCountForm,
  PhysicalStockCountStatus,
} from '../../data/schema'

type PosFooterProps = {
  form: UseFormReturn<PhysicalStockCountForm>
  status: PhysicalStockCountStatus
  busy: 'save' | 'populate' | 'verify' | 'adjust' | null
  totals: {
    totalSystem: number
    totalPhysical: number
    totalSurplus: number
    totalLoss: number
    totalDiff: number
  }
  onSave: () => void
  onVerify: () => void
  onAdjust: () => void
}

const PosFooter = ({
  form,
  status,
  busy,
  totals,
  onSave,
  onVerify,
  onAdjust,
}: PosFooterProps) => {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-6 border-t bg-lime-600/10 px-4 py-2">
      <div className="grid grid-rows-2">
        <Label className="text-xs text-muted-foreground">Remarks</Label>
        <Textarea
          {...form.register('remarks')}
          rows={2}
          placeholder="Add a note to this count sheet"
          className="h-16 resize-none text-sm"
        />
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm font-semibold tabular-nums">
          <span>
            Book:{' '}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {totals.totalSystem.toFixed(2)}
            </span>
          </span>
          <span>
            Physical:{' '}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {totals.totalPhysical.toFixed(2)}
            </span>
          </span>
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            Surplus {totals.totalSurplus.toFixed(2)}
          </span>
          <span className="rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400">
            Loss {totals.totalLoss.toFixed(2)}
          </span>
          <span
            className={
              totals.totalDiff > 0
                ? 'text-red-600'
                : totals.totalDiff < 0
                  ? 'text-emerald-600'
                  : 'text-slate-500'
            }
          >
            Net Diff: {totals.totalDiff.toFixed(2)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button type="button" disabled={busy !== null} onClick={onSave}>
            {busy === 'save' && <Loader2 className="animate-spin" />}
            Save Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null || status !== 'draft'}
            onClick={onVerify}
          >
            {busy === 'verify' && <Loader2 className="animate-spin" />}
            Verify
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy !== null || status !== 'verified'}
            onClick={onAdjust}
          >
            {busy === 'adjust' && <Loader2 className="animate-spin" />}
            Generate Adjustment
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PosFooter
