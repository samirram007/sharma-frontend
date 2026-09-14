import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { IconEdit, IconLoader2 } from '@tabler/icons-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { deliveryNoteQueryOptions } from '@/features/modules/voucher/delivery_note/data/queryOptions'
import DispatchDetailsButton from '@/features/modules/voucher/freight/components/dispatch-details-button'
import { resolveDispatchWeight } from '@/features/modules/voucher/shared/dispatch-defaults'
import { EstimatedHint } from '@/features/modules/voucher/shared/EstimatedHint'
import { cn } from '@/lib/utils'
import { formatLocale, formatQty } from '@/utils/format-num'
import { date_format } from '@/utils/removeEmptyStrings'
// Delivery notes surface from several list screens: the Day Book and the
// Freight Delivery Notes grid pass the full voucher; the Zone/Godown-wise
// reports only have voucherId, so they use the fetch-by-id variant below.
import type { VoucherSchema } from '../../data-schema/voucher-schema'

type Props = {
  data: VoucherSchema
}

const billingPrefColorMap: Record<string, string> = {
  advance:
    'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700',
  current:
    'text-green-600 dark:text-green-400 border-green-300 dark:border-green-700',
  due: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700',
}

/**
 * Delivery Note rows: the first click on the voucher no ("VchNo." on the Day
 * Book, "Dl. No." on the Freight grid) opens a read-only summary dialog;
 * clicking the voucher no again inside the dialog (or the Edit button) pulls
 * up the delivery note edit page.
 */
const VoucherNoSummaryDialog = ({ data }: Props) => {
  return (
    <DialogRoot>
      {(_open, setOpen) => (
        <>
          <DialogTrigger asChild>
            <button
              type="button"
              title="View delivery note summary"
              className="cursor-pointer font-medium text-primary underline decoration-dotted underline-offset-4 hover:decoration-solid"
            >
              {data.voucherNo}
            </button>
          </DialogTrigger>
          <SummaryBody data={data} setOpen={setOpen} />
        </>
      )}
    </DialogRoot>
  )
}

/**
 * Fetch-by-id variant for report rows that only carry the voucher's id/number
 * (the Zone-wise and Godown-wise report detail rows). The dialog body lazy
 * fetches the full delivery note via React Query and shows a loading state
 * while it arrives; Edit still navigates even if the fetch fails.
 */
export const DeliveryNoteSummaryDialogById = ({
  voucherId,
  voucherNo,
}: {
  voucherId: number
  voucherNo: string
}) => {
  return (
    <DialogRoot>
      {(open, setOpen) => (
        <>
          <DialogTrigger asChild>
            <button
              type="button"
              title="View delivery note summary"
              className="cursor-pointer truncate font-mono font-semibold text-gray-700 underline decoration-dotted underline-offset-4 hover:decoration-solid hover:text-primary"
            >
              {voucherNo || '-'}
            </button>
          </DialogTrigger>
          <DeliveryNoteSummaryByIdContent
            voucherId={voucherId}
            voucherNo={voucherNo}
            open={open}
            setOpen={setOpen}
          />
        </>
      )}
    </DialogRoot>
  )
}

/** Shared open-state for both variants. */
const DialogRoot = ({
  children,
}: {
  children: (
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  ) => React.ReactNode
}) => {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children(open, setOpen)}
    </Dialog>
  )
}

type ContentProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DeliveryNoteSummaryByIdContent = ({
  voucherId,
  voucherNo,
  open,
  setOpen,
}: ContentProps & { voucherId: number; voucherNo: string }) => {
  // Only fetch when the dialog is actually opened — keeps the report lists
  // from firing a request per row on mount.
  const { data: response, isLoading } = useQuery({
    ...deliveryNoteQueryOptions(voucherId),
    enabled: open,
  })
  const voucher = (response?.data as VoucherSchema | undefined) ?? null

  if (isLoading) {
    return (
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Delivery Note {voucherNo}</DialogTitle>
          <DialogDescription>Loading summary…</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
          Fetching delivery note…
        </div>
      </DialogContent>
    )
  }

  if (!voucher) {
    return (
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Delivery Note {voucherNo}</DialogTitle>
          <DialogDescription>
            Could not load the delivery note.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 text-center text-sm text-muted-foreground">
          Failed to load the delivery note summary.{' '}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-primary underline"
          >
            Close
          </button>{' '}
          and retry, or open it for editing directly.
        </div>
        <DialogFooter>
          <EditButton voucherId={voucherId} onGo={() => setOpen(false)} />
        </DialogFooter>
      </DialogContent>
    )
  }

  return <SummaryBody data={voucher} setOpen={setOpen} />
}

const SummaryBody = ({
  data,
  setOpen,
}: Omit<ContentProps, 'open'> & { data: VoucherSchema }) => {
  const navigate = useNavigate()

  const dispatchDetail = data.voucherDispatchDetail
  const entries = data.stockJournal?.stockJournalEntries?.filter(Boolean) ?? []
  const total = entries.reduce(
    (acc, entry) => acc + (Number(entry?.amount) || 0),
    0,
  )

  // Total qty grouped per unit — mixing MT + BAGS into one number would be
  // meaningless, so each unit code sums separately (e.g. "18.00 MT + 40 BAGS").
  const totalQtyByUnit = new Map<string, { qty: number; decimals: number }>()
  for (const entry of entries) {
    const unitCode =
      entry?.stockUnit?.code ?? entry?.stockItem?.stockUnit?.code ?? ''
    const decimals =
      entry?.stockUnit?.noOfDecimalPlaces ??
      entry?.stockItem?.stockUnit?.noOfDecimalPlaces ??
      2
    const existing = totalQtyByUnit.get(unitCode) ?? { qty: 0, decimals }
    totalQtyByUnit.set(unitCode, {
      qty: existing.qty + (Number(entry?.actualQuantity) || 0),
      decimals: Math.max(existing.decimals, decimals),
    })
  }
  const totalQtyLabel = [...totalQtyByUnit.entries()]
    .map(
      ([unitCode, { qty, decimals }]) =>
        `${qty.toFixed(decimals)}${unitCode ? ` ${unitCode}` : ''}`,
    )
    .join(' + ')

  // Weight shown on the card: the saved dispatch-detail weight when present,
  // otherwise the calculated weight (sum of the entries' actual quantities) —
  // the same defaulting the Dispatch Details editor prefills with. The value
  // is marked "estimated" until it is saved on the dispatch detail. Unit
  // label comes from the saved weight unit, falling back to the first entry's
  // unit.
  const isSavedWeight = Number(dispatchDetail?.weight) > 0
  const weightValue = resolveDispatchWeight(data)
  const weightUnitCode =
    dispatchDetail?.weightUnit?.code ??
    entries[0]?.stockUnit?.code ??
    entries[0]?.stockItem?.stockUnit?.code ??
    null
  const weightUnitDecimals =
    dispatchDetail?.weightUnit?.noOfDecimalPlaces ??
    entries[0]?.stockUnit?.noOfDecimalPlaces ??
    entries[0]?.stockItem?.stockUnit?.noOfDecimalPlaces ??
    null
  const weightLabel =
    weightValue > 0
      ? formatQty(weightValue, weightUnitDecimals, weightUnitCode)
      : undefined

  const openEditPage = () => {
    setOpen(false)
    navigate({ to: `/transactions/vouchers/delivery_note/${data.id}` })
  }

  return (
    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader className="text-left border-b-2 pb-2">
        <DialogTitle>
          Delivery Note{' '}
          <button
            type="button"
            onClick={openEditPage}
            title="Open delivery note for editing"
            className="cursor-pointer text-primary underline decoration-dotted underline-offset-4 hover:decoration-solid"
          >
            {data.voucherNo}
          </button>
        </DialogTitle>
        <DialogDescription>
          Dated {date_format(data.voucherDate)}
          {(data.partyLedger?.name ?? data.party?.name)
            ? ` · ${data.partyLedger?.name ?? data.party?.name}`
            : ''}{' '}
          — click the voucher no to edit.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Dispatch details */}
        <div className="rounded-md border border-slate-200/70 bg-slate-50/50 p-3 text-sm dark:border-white/[0.07] dark:bg-white/5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <SummaryRow label="Transport" value={dispatchDetail?.carrierName} />
            <SummaryRow
              label="Vehicle No"
              value={dispatchDetail?.motorVehicleNo}
            />
            <SummaryRow
              label="Route"
              value={
                [dispatchDetail?.source, dispatchDetail?.destination]
                  .filter(Boolean)
                  .join(' → ') || undefined
              }
            />
            <SummaryRow
              label="Weight"
              value={weightLabel}
              hint={!isSavedWeight && !!weightLabel}
            />
            <SummaryRow
              label="Rate"
              value={
                Number(dispatchDetail?.rate) > 0
                  ? formatLocale(dispatchDetail?.rate)
                  : undefined
              }
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Billing:</span>
              {dispatchDetail?.billingPreference ? (
                <Badge
                  variant="outline"
                  className={cn(
                    'capitalize text-xs',
                    billingPrefColorMap[dispatchDetail.billingPreference] ?? '',
                  )}
                >
                  {dispatchDetail.billingPreference}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Stock items */}
        <div className="rounded-md border">
          <div className="grid grid-cols-[1fr_110px_110px_120px] gap-2 border-b bg-slate-50/50 px-3 py-2 text-xs font-bold dark:bg-white/5">
            <div>Particulars</div>
            <div className="text-center">Qty</div>
            <div className="text-right">Rate</div>
            <div className="text-right">Amount</div>
          </div>
          {entries.length > 0 ? (
            entries.map((entry, index) => {
              const unitCode =
                entry?.stockUnit?.code ?? entry?.stockItem?.stockUnit?.code
              const decimals =
                entry?.stockUnit?.noOfDecimalPlaces ??
                entry?.stockItem?.stockUnit?.noOfDecimalPlaces
              return (
                <div
                  key={entry?.id ?? index}
                  className="grid grid-cols-[1fr_110px_110px_120px] gap-2 border-b px-3 py-2 text-sm last:border-b-0"
                >
                  <div>
                    <div>{entry?.stockItem?.name ?? '—'}</div>
                    {entry?.stockJournalGodownEntries
                      ?.filter(Boolean)
                      .map((godownEntry, gIndex) => (
                        <div
                          key={godownEntry?.id ?? gIndex}
                          className="text-[11px] text-muted-foreground"
                        >
                          {godownEntry?.godown?.name}
                          {godownEntry?.batchNo
                            ? ` · Batch: ${godownEntry.batchNo.toUpperCase()}`
                            : ''}
                        </div>
                      ))}
                  </div>
                  <div className="text-center">
                    {formatQty(entry?.actualQuantity, decimals, unitCode)}
                  </div>
                  <div className="text-right">
                    {Number(entry?.rate) > 0
                      ? `${formatLocale(entry?.rate)} / ${unitCode ?? ''}`
                      : '—'}
                  </div>
                  <div className="text-right font-semibold">
                    {formatLocale(entry?.amount)}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No stock items.
            </div>
          )}
          <div className="grid grid-cols-[1fr_110px_110px_120px] gap-2 border-t-2 px-3 py-2 text-sm font-bold">
            <div className="col-span-2 text-right">Total Qty:</div>
            <div className="text-center text-xs">{totalQtyLabel || '—'}</div>
            <div className="text-right">{formatLocale(total)}</div>
          </div>
        </div>

        {/* Narration */}
        {data.remarks && (
          <div className="text-sm">
            <span className="font-semibold">Narration: </span>
            <span className="text-muted-foreground whitespace-pre-wrap">
              {data.remarks}
            </span>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          className="h-8"
          onClick={() => setOpen(false)}
        >
          Close
        </Button>
        {data.id && (
          <DispatchDetailsButton data={data} triggerLabel="Dispatch Details" />
        )}
        <EditButton voucherId={data.id} onGo={setOpen} />
      </DialogFooter>
    </DialogContent>
  )
}

const EditButton = ({
  voucherId,
  onGo,
}: {
  voucherId: number | null | undefined
  onGo: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const navigate = useNavigate()
  if (!voucherId) return null
  return (
    <Button
      className="h-8"
      onClick={() => {
        onGo(false)
        navigate({ to: `/transactions/vouchers/delivery_note/${voucherId}` })
      }}
    >
      <IconEdit size={16} /> Edit Delivery Note
    </Button>
  )
}

const SummaryRow = ({
  label,
  value,
  hint,
}: {
  label: string
  value?: string | null
  /** Small suffix badge, e.g. "estimated" for a not-yet-saved calculated weight. */
  hint?: boolean
}) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-muted-foreground">{label}:</span>
    <span className="flex items-center gap-1.5 text-right font-medium">
      {value || '—'}
      {hint && <EstimatedHint />}
    </span>
  </div>
)

export default VoucherNoSummaryDialog
