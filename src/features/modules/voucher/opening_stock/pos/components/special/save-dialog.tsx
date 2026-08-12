import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useOpeningStockVoucherMutation } from '../../../data/queryOptions'
import { Button } from '@/components/ui/button'
import type { UseFormReturn } from 'react-hook-form'
import type { OpeningStockVoucherForm } from '../../../data/schema'
import { Loader } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getServerErrorMessage } from '@/utils/handle-server-error'
import type {
  StockJournalEntryForm,
  StockJournalGodownEntryForm,
} from '@/features/modules/voucher/data-schema/voucher-schema'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import type { OpeningStockVoucher } from '../../../data/schema'
import {
  OpeningStockVoucherQueryOptions,
  openingStockVoucherTypeQueryOptions,
} from '../../../data/queryOptions'

type SaveDialogProps = {
  mainForm: UseFormReturn<OpeningStockVoucherForm>
  isSaving: boolean
  setSaving: React.Dispatch<React.SetStateAction<boolean>>
}

const SaveDialog = ({ mainForm, isSaving, setSaving }: SaveDialogProps) => {
  const { userFiscalYear } = useAuth()
  const { mutate: saveOpeningStock, isPending } =
    useOpeningStockVoucherMutation()

  // OPNSK type id is resolved from the backend at runtime (not stable across
  // databases) — the duplicate-voucher check must filter by the real id.
  const { data: openingStockType } = useQuery(
    openingStockVoucherTypeQueryOptions(),
  )

  const { data: existingVouchers } = useQuery({
    ...OpeningStockVoucherQueryOptions(openingStockType?.data?.id),
    enabled: isSaving && !!openingStockType?.data?.id,
  })

  const [errors, setErrors] = useState<string[]>([])
  const [checking, setChecking] = useState(true)
  const [valid, setValid] = useState(false) // for success animation

  const handleSaving = () => {
    // The backend re-validates server-side (e.g. the one-opening-stock-per-
    // fiscal-year rule) — surface a rejected save instead of silently
    // swallowing it, in case a duplicate slips past the client checks
    // (stale tab, double-submit race, another client).
    saveOpeningStock(mainForm.getValues(), {
      onError: (error) => {
        toast.error(
          getServerErrorMessage(error, 'Failed to save opening stock voucher.'),
        )
      },
    })
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
        // Parse 'YYYY-MM-DD' as local midnight to avoid UTC date-shifting.
        const startDate = new Date(
          `${userFiscalYear.fiscalYear.startDate}T00:00:00`,
        )
        const endDate = new Date(
          `${userFiscalYear.fiscalYear.endDate}T00:00:00`,
        )

        // Opening stock must be dated the FIRST day of the fiscal year.
        const sameDayAsStart =
          vDate.getFullYear() === startDate.getFullYear() &&
          vDate.getMonth() === startDate.getMonth() &&
          vDate.getDate() === startDate.getDate()

        if (!sameDayAsStart) {
          newErrors.push(
            `Opening stock voucher must be dated the first day of the fiscal year (${startDate.toLocaleDateString()}).`,
          )
        }

        if (vDate < startDate || vDate > endDate) {
          newErrors.push(
            `Voucher date (${vDate.toLocaleDateString()}) must be within the fiscal year period (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}).`,
          )
        }
      }

      // --- ONE VOUCHER PER FISCAL YEAR ---
      const openingStockId = (data as Partial<OpeningStockVoucher>).id
      const existingForFy = (existingVouchers ?? []).find(
        (v) =>
          v.fiscalYearId === userFiscalYear?.fiscalYearId &&
          v.id !== openingStockId,
      )
      if (existingForFy) {
        newErrors.push(
          `Opening stock already exists for this fiscal year (${existingForFy.voucherNo}). Only one opening stock voucher is allowed per fiscal year.`,
        )
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

      if (!hasInEntry) {
        newErrors.push(
          'At least one IN entry (opening stock quantity) is required.',
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
  }, [isPending, setSaving, userFiscalYear, mainForm, existingVouchers])

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
            <DialogTitle>Opening Stock </DialogTitle>
            <DialogDescription>
              Please wait while we are saving the opening stock voucher.
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
