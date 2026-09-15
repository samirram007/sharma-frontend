import { Button } from '@/components/ui/button'
import { useFocusArea } from '@/core/hooks/useFocusArea'
import { useEffect, useRef, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import type { ReceiptNoteForm } from '../../data/schema'
import NarrationBox from './special/narration-box'
import SaveDialog from './special/save-dialog'

type PosFooterProps = {
  mainForm: UseFormReturn<ReceiptNoteForm>
}

const PosFooter = ({ mainForm }: PosFooterProps) => {
  const footerRef = useRef<HTMLDivElement>(null)
  const [isSaving, setSaving] = useState(false)

  useFocusArea(footerRef as React.RefObject<HTMLElement>)
  // useRestrictFocusToRef(footerRef as React.RefObject<HTMLElement>);
  const { watch } = mainForm
  const total =
    watch('stockJournal.stockJournalEntries')?.reduce(
      (acc, entry) => acc + (entry?.amount || 0),
      0,
    ) || 0
  const partyLedgerId = watch('partyLedger.id')
  const transactionLedgerId = watch('transactionLedger.id')

  // Remember which ledger owned each role on the previous pass, so a changed
  // ledger is re-pointed to the existing entry (keeping its DB id) instead of
  // leaving a stale leg behind while a new one is appended.
  const prevPartyLedgerIdRef = useRef<number | null>(null)
  const prevTransactionLedgerIdRef = useRef<number | null>(null)

  useEffect(() => {
    const voucherEntries = mainForm.getValues('voucherEntries') || []

    if (!transactionLedgerId || !partyLedgerId) return

    let updated = [...voucherEntries]

    // Find the entry currently serving a role. If the ledger for the role
    // changed, the leg from the previous pass is re-pointed to the new ledger
    // — its preserved id makes the backend UPDATE the voucher_entries row.
    // Vouchers edited before that fix was in place can have a party leg still
    // pointing at the old ledger, so when no direct/previous match exists we
    // adopt the leg carrying this role's direction (party credits on receipt
    // notes, transaction debits) and re-point it instead of adding a new leg
    // — which would double-count the amount.
    const takeLeg = (
      currentId: number,
      previousId: number | null | undefined,
      adoptDirection: 'debit' | 'credit' | null,
    ) => {
      const directIndex = updated.findIndex(
        (e) => e && e.accountLedgerId === currentId,
      )
      if (directIndex >= 0) return updated[directIndex]

      if (previousId != null) {
        const staleIndex = updated.findIndex(
          (e) => e && e.accountLedgerId === previousId,
        )
        if (staleIndex >= 0) {
          updated[staleIndex] = {
            ...updated[staleIndex],
            accountLedgerId: currentId,
          }
          return updated[staleIndex]
        }
      }

      if (adoptDirection) {
        const adoptedIndex = updated.findIndex(
          (e) =>
            e &&
            e.accountLedgerId !== transactionLedgerId &&
            Number(e[adoptDirection]) > 0,
        )
        if (adoptedIndex >= 0) {
          updated[adoptedIndex] = {
            ...updated[adoptedIndex],
            accountLedgerId: currentId,
          }
          return updated[adoptedIndex]
        }
      }

      return undefined
    }

    // --- STEP 1: ensure transaction entry exists ---
    let transactionEntry = takeLeg(
      transactionLedgerId,
      prevTransactionLedgerIdRef.current,
      'debit',
    )

    if (!transactionEntry) {
      transactionEntry = {
        id: undefined,
        voucherId: undefined,
        accountLedgerId: transactionLedgerId,
        debit: 0,
        credit: 0,
        remarks: '',
        entryOrder: updated.length + 1,
      }
      updated.push(transactionEntry)
    }

    // --- STEP 2: ensure party entry exists ---
    let partyEntry = takeLeg(
      partyLedgerId,
      prevPartyLedgerIdRef.current,
      'credit',
    )

    if (!partyEntry) {
      partyEntry = {
        id: undefined,
        voucherId: undefined,
        accountLedgerId: partyLedgerId,
        debit: 0,
        credit: 0,
        remarks: '',
        entryOrder: updated.length + 1,
      }
      updated.push(partyEntry)
    }

    // --- STEP 3: update debit/credit values ---
    updated = updated
      .filter((entry) => entry !== null && entry !== undefined)
      .map((entry, idx) => {
        // ensure entryOrder is always correct
        const entryOrder = idx + 1

        if (entry === transactionEntry) {
          return { ...entry, debit: total, credit: 0, entryOrder }
        }
        if (entry === partyEntry) {
          return { ...entry, debit: 0, credit: total, entryOrder }
        }
        return { ...entry, accountLedgerId: entry.accountLedgerId!, entryOrder }
      })

    mainForm.setValue('voucherEntries', updated, {
      shouldValidate: false,
      shouldDirty: true,
    })

    prevPartyLedgerIdRef.current = partyLedgerId
    prevTransactionLedgerIdRef.current = transactionLedgerId
  }, [total, partyLedgerId, transactionLedgerId])

  return (
    <div
      ref={footerRef}
      className="bg-red-500/10 dark:bg-red-500/20 grid grid-cols-[1fr_1fr] px-8"
    >
      <div className="grid ">
        {/* <Button autoFocus={true} variant="outline" className="w-full h-20 text-left"

                    type="button" asChild  > 
                        </Button>*/}
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
      <div className="grid grid-rows-[1fr_1fr]  items-start  justify-end">
        <div className="grid grid-cols-[1fr_140px] pt-2">
          <div className="text-right font-bold  ">
            Total: {total ? Number(total).toFixed(2) : 0}
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
