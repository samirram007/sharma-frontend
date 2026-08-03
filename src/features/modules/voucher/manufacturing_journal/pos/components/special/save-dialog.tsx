import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useManufacturingJournalVoucherMutation } from '../../../data/queryOptions'
import { Button } from '@/components/ui/button'
import type { UseFormReturn } from 'react-hook-form'
import type { ManufacturingJournalVoucherForm } from '../../../data/schema'
import { Loader } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import type {
  StockJournalEntryForm,
  StockJournalGodownEntryForm,
} from '@/features/modules/voucher/data-schema/voucher-schema'
import { useAuth } from '@/features/auth/contexts/AuthContext'

type SaveDialogProps = {
  mainForm: UseFormReturn<ManufacturingJournalVoucherForm>
  isSaving: boolean
  setSaving: React.Dispatch<React.SetStateAction<boolean>>
}

const SaveDialog = ({ mainForm, isSaving, setSaving }: SaveDialogProps) => {
  const { userFiscalYear } = useAuth()
  const { mutate: saveManufacturingJournal, isPending } =
    useManufacturingJournalVoucherMutation()

  const [errors, setErrors] = useState<string[]>([])
  const [checking, setChecking] = useState(true)
  const [valid, setValid] = useState(false) // for success animation

  const handleSaving = () => {
    saveManufacturingJournal(mainForm.getValues())
  }

  const saveButtonRef = React.useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    // Start checking animation
    setChecking(true)
    setValid(false)

    timer = setTimeout(() => {
      const data = mainForm.getValues()
      const newErrors: string[] = []

      // --- FISCAL YEAR VALIDATIONS ---
      if (!userFiscalYear) {
        newErrors.push(
          'No active fiscal year assigned. Please assign one in settings.',
        )
      } else if (userFiscalYear.fiscalYear?.status !== 'active') {
        newErrors.push(
          `The assigned fiscal year (${userFiscalYear.fiscalYear?.name}) is currently ${userFiscalYear.fiscalYear?.status}. It must be active to save vouchers.`,
        )
      }

      const voucherDate = data.voucherDate
      if (userFiscalYear?.fiscalYear && voucherDate) {
        const vDate = new Date(voucherDate)
        const startDate = new Date(userFiscalYear.fiscalYear.startDate)
        const endDate = new Date(userFiscalYear.fiscalYear.endDate)

        if (vDate < startDate || vDate > endDate) {
          newErrors.push(
            `Voucher date (${vDate.toLocaleDateString()}) must be within the fiscal year period (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}).`,
          )
        }
      }

      // --- STOCK JOURNAL VALIDATIONS ---
      const stockJournalEntries: StockJournalEntryForm[] = (
        data.stockJournal?.stockJournalEntries || []
      ).filter(Boolean) as StockJournalEntryForm[]

      if (stockJournalEntries.length === 0) {
        newErrors.push('Please add at least one stock item entry.')
      }

      const hasInEntry = stockJournalEntries.some(
        (e) => e.movementType === 'in',
      )
      const hasOutEntry = stockJournalEntries.some(
        (e) => e.movementType === 'out',
      )

      if (!hasInEntry) {
        newErrors.push(
          'At least one IN entry (finished goods produced) is required.',
        )
      }
      if (!hasOutEntry) {
        newErrors.push(
          'At least one OUT entry (raw materials consumed) is required.',
        )
      }

      // --- Duplicate stock item check ---
      const stockItemIds = stockJournalEntries.map((e) => e.stockItemId)
      const unique = new Set(stockItemIds)
      if (unique.size !== stockItemIds.length) {
        newErrors.push(
          'Duplicate stock items detected — each stock item must be unique.',
        )
      }

      // --- Combined Entry + Godown validations ---
      stockJournalEntries.forEach((stockJournalEntry, entryIndex) => {
        if (!stockJournalEntry.stockItemId) {
          newErrors.push(`Entry #${entryIndex + 1}: Stock item is required.`)
        }
        if (!stockJournalEntry.amount || stockJournalEntry.amount <= 0) {
          newErrors.push(
            `Entry #${entryIndex + 1}: Amount must be greater than 0.`,
          )
        }

        const stockJournalGodownEntries = (
          stockJournalEntry.stockJournalGodownEntries || []
        ).filter(Boolean) as StockJournalGodownEntryForm[]
        if (stockJournalGodownEntries.length === 0) {
          newErrors.push(
            `Entry #${entryIndex + 1}: At least one godown entry is required.`,
          )
        }

        // Duplicate godownId + batchNo pairs
        const combos = stockJournalGodownEntries.map(
          (g) => `${g.godownId}-${g.batchNo || ''}`,
        )
        const comboUnique = new Set(combos)
        if (comboUnique.size !== combos.length) {
          newErrors.push(
            `Entry #${entryIndex + 1}: Duplicate godown + batch combinations found.`,
          )
        }

        stockJournalGodownEntries.forEach((g, gIndex) => {
          if (!g) return
          if (!g.godownId) {
            newErrors.push(
              `Entry #${entryIndex + 1}, Godown #${gIndex + 1}: Select a godown.`,
            )
          }
          if (!g.billingQuantity || g.billingQuantity <= 0) {
            newErrors.push(
              `Entry #${entryIndex + 1}, Godown #${gIndex + 1}: Billing qty must be > 0.`,
            )
          }
          if (!g.amount || g.amount <= 0) {
            newErrors.push(
              `Entry #${entryIndex + 1}, Godown #${gIndex + 1}: Amount must be > 0.`,
            )
          }
        })
      })

      // UPDATE STATE
      setErrors(newErrors)
      setChecking(false)
      setValid(newErrors.length === 0)
    }, 2000) // 👈 small delay for UX + animation

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isPending, setSaving, userFiscalYear, mainForm])

  useEffect(() => {
    if (valid) {
      saveButtonRef.current?.focus()
    }
  }, [valid])

  return (
    <div>
      <Dialog
        open={isSaving}
        onOpenChange={(state) => {
          setSaving(state)
        }}
      >
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="default"
            className="h-8 w-full focus:bg-black focus:text-white"
            size="lg"
            disabled={isSaving}
          >
            <Loader className="animate-spin" /> Saving...
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader className="text-left border-b-2 pb-2">
            <DialogTitle>Manufacturing Journal </DialogTitle>
            <DialogDescription>
              Please wait while we are saving the manufacturing journal.
            </DialogDescription>
          </DialogHeader>
          <div className="-mr-4 h-full w-full overflow-y-auto py-1 pr-4">
            {checking && (
              <div className="text-blue-500 animate-pulse">Validating...</div>
            )}

            {valid && (
              <div className="text-green-600 font-semibold animate-bounce">
                ✔ All checks passed!
              </div>
            )}

            {errors.length > 0 && (
              <ul className="text-red-500 space-y-1 mt-2">
                {errors.map((err, i) => (
                  <li key={i} className="flex gap-2">
                    • <span>{err}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaving}
              ref={saveButtonRef}
              disabled={isPending || errors.length > 0 || checking || !valid}
              className={`h-8 ${valid ? 'focus:bg-black focus:text-white' : ''}`}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default SaveDialog
