import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTransferVoucherVoucherMutation } from '../../../data/queryOptions'
import { Button } from '@/components/ui/button'
import type { UseFormReturn } from 'react-hook-form'
import type { TransferVoucherVoucherForm } from '../../../data/schema'
import { Loader } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import type {
  StockJournalEntryForm,
  StockJournalGodownEntryForm,
} from '@/features/modules/voucher/data-schema/voucher-schema'
import { useAuth } from '@/features/auth/contexts/AuthContext'

type SaveDialogProps = {
  mainForm: UseFormReturn<TransferVoucherVoucherForm>
  isSaving: boolean
  setSaving: React.Dispatch<React.SetStateAction<boolean>>
}

const SaveDialog = ({ mainForm, isSaving, setSaving }: SaveDialogProps) => {
  const { userFiscalYear } = useAuth()
  const { mutate: saveTransferVoucher, isPending } =
    useTransferVoucherVoucherMutation()

  const [errors, setErrors] = useState<string[]>([])
  const [checking, setChecking] = useState(true)
  const [valid, setValid] = useState(false) // for success animation

  const handleSaving = () => {
    saveTransferVoucher(mainForm.getValues())
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

      // --- Duplicate stock item check ---
      const stockItemIds = stockJournalEntries.map((e) => e.stockItemId)
      const unique = new Set(stockItemIds)
      if (unique.size !== stockItemIds.length) {
        newErrors.push(
          'Duplicate stock items detected — each stock item must be unique.',
        )
      }

      // --- Per-entry transfer validations ---
      stockJournalEntries.forEach((stockJournalEntry, entryIndex) => {
        if (!stockJournalEntry.stockItemId) {
          newErrors.push(`Entry #${entryIndex + 1}: Stock item is required.`)
        }

        const godownEntries = (
          stockJournalEntry.stockJournalGodownEntries || []
        ).filter(Boolean) as StockJournalGodownEntryForm[]

        if (godownEntries.length < 2) {
          newErrors.push(
            `Entry #${entryIndex + 1}: A transfer needs at least two godown rows (source OUT and destination IN).`,
          )
        }

        const outRows = godownEntries.filter((g) => g.movementType === 'out')
        const inRows = godownEntries.filter((g) => g.movementType === 'in')

        if (outRows.length === 0) {
          newErrors.push(
            `Entry #${entryIndex + 1}: Mark at least one godown row as OUT (source godown).`,
          )
        }
        if (inRows.length === 0) {
          newErrors.push(
            `Entry #${entryIndex + 1}: Mark at least one godown row as IN (destination godown).`,
          )
        }

        // Quantity balance: total OUT qty must equal total IN qty per item
        if (outRows.length > 0 && inRows.length > 0) {
          const outQty = outRows.reduce(
            (acc, g) => acc + (Number(g.billingQuantity) || 0),
            0,
          )
          const inQty = inRows.reduce(
            (acc, g) => acc + (Number(g.billingQuantity) || 0),
            0,
          )
          if (Math.abs(outQty - inQty) > 0.0001) {
            newErrors.push(
              `Entry #${entryIndex + 1}: Transferred quantity must balance — OUT ${outQty.toFixed(2)} ≠ IN ${inQty.toFixed(2)}.`,
            )
          }
        }

        // Same godown used for both directions
        const outGodownIds = new Set(outRows.map((g) => g.godownId))
        const inGodownIds = new Set(inRows.map((g) => g.godownId))
        const shared = [...outGodownIds].filter(
          (id) => id && inGodownIds.has(id),
        )
        if (shared.length > 0) {
          newErrors.push(
            `Entry #${entryIndex + 1}: A godown cannot be both the source and the destination of the same transfer.`,
          )
        }

        // Duplicate godownId + batchNo pairs
        const combos = godownEntries.map(
          (g) => `${g.godownId}-${g.batchNo || ''}`,
        )
        const comboUnique = new Set(combos)
        if (comboUnique.size !== combos.length) {
          newErrors.push(
            `Entry #${entryIndex + 1}: Duplicate godown + batch combinations found.`,
          )
        }

        godownEntries.forEach((g, gIndex) => {
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
            <DialogTitle>Transfer Voucher </DialogTitle>
            <DialogDescription>
              Please wait while we are saving the transfer voucher.
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
