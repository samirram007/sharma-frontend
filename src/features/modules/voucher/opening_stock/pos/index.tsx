import { Form } from '@/components/ui/form'
import { useFocusArea } from '@/core/hooks/useFocusArea'
import { useRestrictFocusToRef } from '@/core/hooks/useRestrictFocusToRef'
import { useScrollTopAfterFetch } from '@/core/hooks/use-scroll-top-after-fetch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { IconAlertTriangle, IconLock } from '@tabler/icons-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { canEditOpeningStock } from '@/lib/auth'
import { usePos } from '../../contexts/pos-context'
import { normalizeStockJournalMovementType } from '../../data-schema/movement-type'
import type { StockJournalForm } from '../../data-schema/voucher-schema'
import { fetchPreviousYearClosingStockService } from '../data/api'
import OpeningStockDefaultValues, {
  openingStockJournalDefaultValues,
} from '../data/data'
import {
  OpeningStockVoucherQueryOptions,
  openingStockVoucherTypeQueryOptions,
} from '../data/queryOptions'
import {
  OpeningStockFormSchema,
  type OpeningStockVoucher,
  type OpeningStockVoucherForm,
  type PreviousYearClosingStockResponse,
} from '../data/schema'
import PosBody from './components/pos-body'
import PosFooter from './components/pos-footer'
import PosHeader from './components/pos-header'
import type { ClosingInfo, OpeningStockProps } from './contracts'

const Pos = ({ currentRow }: OpeningStockProps) => {
  const areaRef = useRef<HTMLDivElement>(null)
  const { setMovementType, setPerRowMovementType } = usePos()
  const { user, userFiscalYear } = useAuth()
  useFocusArea(areaRef as React.RefObject<HTMLElement>)
  useRestrictFocusToRef(areaRef as React.RefObject<HTMLElement>)
  const isEdit = !!currentRow?.id
  // Opening Stock is always an IN journal — normalize any legacy 'out' rows
  // (saved before the "IN ⇒ free-text batch" fix) so re-saves send 'in'.
  const data = {
    ...currentRow,
    stockJournal: normalizeStockJournalMovementType(
      currentRow?.stockJournal,
      'in',
    ),
  }

  // ── Opening Stock rules (frontend-level) ────────────────────────────────
  // 1. Only admin / developer roles can create or edit opening stock.
  // 2. Only ONE opening stock voucher per fiscal year, dated the FIRST day
  //    of the fiscal year.
  const canEdit = canEditOpeningStock(user?.roles)
  const currentFyId = userFiscalYear?.fiscalYearId
  const fyStartDate = userFiscalYear?.fiscalYear?.startDate

  // The OPNSK voucher type id is resolved from the backend at runtime — it is
  // NOT stable across databases (legacy 9010 vs fresh 10004) — and drives both
  // the list filter below and the store/update payload stamping in the mutation.
  const { data: openingStockType } = useQuery(
    openingStockVoucherTypeQueryOptions(),
  )
  const openingStockTypeId = openingStockType?.data?.id

  // The existence check runs in BOTH flows (create + edit of the one existing
  // voucher): the "Fetch Previous Year Closing Stock" button must be hidden
  // whenever an opening stock voucher exists for the fiscal year — even while
  // an admin edits it. The list is tiny (one per FY) and already cached from
  // the index-route redirect, so the extra fetch on edit is negligible.
  const { data: existingVouchers } = useQuery({
    ...OpeningStockVoucherQueryOptions(openingStockTypeId),
    enabled: !!currentFyId && !!openingStockTypeId,
  })

  const existingForFy = useMemo(
    () =>
      (existingVouchers ?? []).find(
        (v) => v.fiscalYearId === currentFyId && v.id !== currentRow?.id,
      ),
    [existingVouchers, currentFyId, currentRow?.id],
  )

  // Block creating a second opening stock voucher for the same FY.
  const lockedByExisting = !isEdit && !!existingForFy
  // Others may view, only admins/developers may edit.
  const readOnly = !canEdit || lockedByExisting
  // "Fetch Previous Year Closing Stock" only makes sense when NO opening
  // stock voucher exists yet — once one is saved the entries are loaded from
  // it (see the opening_stock index route redirect), so the fetch button is
  // hidden and the handler short-circuits. This deliberately counts the
  // voucher being edited too: an admin editing the ONE existing voucher must
  // not be able to re-fetch either (that would replace real opening entries
  // with last year's data).
  const hasExistingForFy = useMemo(
    () => (existingVouchers ?? []).some((v) => v.fiscalYearId === currentFyId),
    [existingVouchers, currentFyId],
  )

  const defaultVoucherDate = useMemo(() => {
    if (isEdit) return undefined // keep the loaded voucher date
    if (fyStartDate) {
      // Parse 'YYYY-MM-DD' as local midnight to avoid UTC date-shifting.
      const d = new Date(`${fyStartDate}T00:00:00`)
      return isNaN(d.getTime()) ? undefined : d
    }
    return undefined
  }, [isEdit, fyStartDate])

  const mainForm = useForm<OpeningStockVoucherForm>({
    resolver: zodResolver(
      OpeningStockFormSchema,
    ) as Resolver<OpeningStockVoucherForm>,
    defaultValues: isEdit
      ? { ...data, isEdit: true }
      : {
          ...OpeningStockDefaultValues,
          voucherDate:
            defaultVoucherDate ?? OpeningStockDefaultValues.voucherDate,
          isEdit: false,
        },
  })

  useEffect(() => {
    // Opening Stock is a stock-in voucher — every row records opening quantity (IN).
    setMovementType?.('in')
    setPerRowMovementType?.(false)
  }, [setMovementType, setPerRowMovementType])

  // ── Fetch previous year closing stock ────────────────────────────────
  // Loads the previous FY's CLSSK closing voucher (item → godown → batch)
  // and pre-fills the opening stock grid, so quantities don't need to be
  // re-entered after a fiscal year close.
  const [isFetchingClosing, setIsFetchingClosing] = useState(false)
  const [closingInfo, setClosingInfo] = useState<ClosingInfo | null>(null)

  // Scroll container of the entry grid — after a closing-stock fetch completes
  // it is scrolled back to the top so the imported rows are immediately visible.
  const bodyScrollRef = useRef<HTMLDivElement>(null)
  useScrollTopAfterFetch(bodyScrollRef, isFetchingClosing)

  const mapClosingVoucherToStockJournal = (
    closingVoucher: OpeningStockVoucher | null | undefined,
  ): StockJournalForm | undefined => {
    const normalized = normalizeStockJournalMovementType(
      closingVoucher?.stockJournal,
      'in',
    )
    if (!normalized) return undefined

    // Strip persisted ids so saving creates fresh records instead of
    // updating the previous year's closing stock rows, and reset the journal
    // metadata (the CLSSK journal is dated at the previous FY end).
    return {
      ...normalized,
      id: undefined,
      voucherId: undefined,
      journalNo: '',
      journalDate: fyStartDate
        ? new Date(`${fyStartDate}T00:00:00`)
        : undefined,
      // The journal type for an opening stock voucher is the OPNSK module
      // code (the backend stamps it too). Entries/godown rows stay 'in'.
      type: 'OPNSK',
      remarks: '',
      stockJournalEntries: (normalized.stockJournalEntries ?? [])
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
        .map((entry) => ({
          ...entry,
          id: undefined,
          stockJournalId: undefined,
          stockJournalGodownEntries: (entry.stockJournalGodownEntries ?? [])
            .filter((ge): ge is NonNullable<typeof ge> => Boolean(ge))
            .map((ge) => ({
              ...ge,
              id: undefined,
              stockJournalEntryId: undefined,
            })),
        })),
    }
  }

  const handleFetchPreviousClosing = async () => {
    if (isFetchingClosing) return

    // The fetch is only meant for a brand-new opening stock voucher — if one
    // already exists for this fiscal year, the entries come from it instead.
    if (hasExistingForFy) {
      toast.error('Opening stock already exists for this fiscal year.')
      return
    }

    // Don't silently overwrite rows the user has already entered.
    const hasManualEntries = (
      mainForm.getValues('stockJournal.stockJournalEntries') ?? []
    ).some(
      (entry) =>
        entry?.stockItemId ||
        Number(entry?.actualQuantity) > 0 ||
        Number(entry?.amount) > 0,
    )
    if (
      hasManualEntries &&
      !window.confirm(
        'This will replace the current entries with the previous year closing stock. Continue?',
      )
    ) {
      return
    }

    setIsFetchingClosing(true)
    try {
      const response = await fetchPreviousYearClosingStockService()
      const responseData = (response?.data ??
        null) as PreviousYearClosingStockResponse | null
      const stockJournal = mapClosingVoucherToStockJournal(
        responseData?.closingVoucher,
      )

      if (!stockJournal || stockJournal.stockJournalEntries?.length === 0) {
        toast.error(
          responseData?.previousFiscalYear
            ? `No closing stock or stock movements found for ${responseData.previousFiscalYear.name}.`
            : 'No previous fiscal year closing stock found.',
        )
        return
      }

      // The backend falls back to the previous year's running balance when no
      // frozen CLSSK closing journal exists (source: 'running'), so the opening
      // stock can be pre-filled even when the previous year wasn't closed.
      const isRunningBalance = responseData?.source === 'running'

      mainForm.setValue('stockJournal', stockJournal, { shouldDirty: true })
      setClosingInfo({
        fyName:
          responseData?.previousFiscalYear?.name ?? 'previous fiscal year',
        voucherNo: responseData?.closingVoucherNo ?? '',
        itemCount: stockJournal.stockJournalEntries.length,
        source: responseData?.source ?? undefined,
      })
      toast.success(
        isRunningBalance
          ? `Loaded ${stockJournal.stockJournalEntries.length} item(s) from ${responseData?.previousFiscalYear?.name ?? 'previous fiscal year'} running balance (no closing journal found).`
          : `Loaded ${stockJournal.stockJournalEntries.length} item(s) from ${responseData?.previousFiscalYear?.name ?? 'previous fiscal year'} closing stock.`,
      )
    } catch (error) {
      console.error('Failed to fetch previous year closing stock:', error)
      toast.error('Failed to fetch previous year closing stock.')
    } finally {
      setIsFetchingClosing(false)
    }
  }

  const handleClearClosing = () => {
    mainForm.setValue(
      'stockJournal',
      { ...openingStockJournalDefaultValues } as StockJournalForm,
      { shouldDirty: true },
    )
    setClosingInfo(null)
  }

  return (
    <>
      {readOnly && (
        <div className="mb-2 grid grid-cols-2 gap-2 px-2">
          {!canEdit && (
            <div className="flex items-center gap-2 rounded-md border border-sky-500/50 bg-sky-50 dark:bg-sky-950/20 px-3 py-2 text-xs text-sky-800 dark:text-sky-300">
              <IconLock className="h-4 w-4 shrink-0" />
              View-only — only admin or developer can create or edit opening
              stock.
            </div>
          )}
          {lockedByExisting && (
            <div className="flex items-center gap-2 rounded-md border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              Opening stock already exists for this fiscal year (
              {existingForFy?.voucherNo}). Only one opening stock voucher is
              allowed per fiscal year.
            </div>
          )}
        </div>
      )}
      {/* h-[calc(100dvh-122px)] = fills the viewport below the fixed app
          header + breadcrumbs (measured 122px). grid-rows-1 so the single
          fieldset child fills the whole height (was grid-rows-[1fr_100px]
          which left a dead 100px second row). */}
      <div
        ref={areaRef}
        className="voucher-entry w-full grid grid-rows-1
             h-[calc(100dvh-122px)]"
      >
        <Form {...mainForm}>
          <fieldset
            disabled={readOnly}
            className="flex h-full min-w-0 flex-col overflow-hidden"
          >
            <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
              <PosHeader
                mainForm={mainForm}
                isFetchingClosing={!readOnly ? isFetchingClosing : false}
                onFetchPreviousClosing={
                  !hasExistingForFy && !readOnly
                    ? handleFetchPreviousClosing
                    : undefined
                }
                closingInfo={!readOnly ? closingInfo : null}
                onClearClosing={!readOnly ? handleClearClosing : undefined}
              />
              <PosBody mainForm={mainForm} scrollRef={bodyScrollRef} />
            </div>
            <PosFooter mainForm={mainForm} readOnly={readOnly} />
          </fieldset>
        </Form>
      </div>
    </>
  )
}

export default Pos
