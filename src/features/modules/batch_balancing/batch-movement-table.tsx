import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatQty } from '@/utils/format-num'
import { formatAmount, formatDate } from './format'
import type { BatchBalance, BatchMovement } from './data/schema'

/**
 * Chronological movement trail of one batch: the opening rows (9010 journal
 * and/or the pre-period movements folded into Opening), the in-window
 * movements with their running balance, and the closing summary row.
 */
export function BatchMovementTable({
  batch,
  openingAsOnDate,
}: {
  batch: BatchBalance
  /**
   * "Opening as on" date (yyyy-MM-dd) — the 9010 opening voucher's date (the
   * FY first day, e.g. 1-Apr), falling back to the reporting-period start.
   * Labels the opening summary row.
   */
  openingAsOnDate?: string | null
}) {
  const dp = batch.noOfDecimalPlaces
  const godownLabel = batch.godownName ?? `Godown #${batch.godownId}`

  // The serial column only appears when this batch's rows actually carry
  // serial numbers — no vertical space wasted otherwise.
  const hasSerials =
    batch.movements.some((m) => !!m.serialNo) ||
    (batch.openingMovements?.some((m) => !!m.serialNo) ?? false)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            {/* Batch no + godown repeat on every row so a printed or pasted
                trail stays self-describing (and sorts/filters by batch). */}
            <th className="px-4 py-2 text-left font-medium">Batch no</th>
            <th className="px-3 py-2 text-left font-medium">Godown</th>
            <th className="px-4 py-2 text-left font-medium">Date</th>
            <th className="px-3 py-2 text-left font-medium">Voucher</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            {hasSerials && (
              <th className="px-3 py-2 text-left font-medium">Serial</th>
            )}
            <th className="px-3 py-2 text-right font-medium">Inward</th>
            <th className="px-3 py-2 text-right font-medium">Outward</th>
            <th className="px-3 py-2 text-right font-medium">Balance</th>
            <th className="px-3 py-2 text-right font-medium">Rate</th>
            <th className="px-3 py-2 text-right font-medium">Value</th>
            <th className="px-4 py-2 text-left font-medium">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {/* Opening rows — one per current-FY opening row (opening-stock
              journal and/or pre-period movements), each tagged with its kind
              and a running balanceAfter; else a single carried-forward
              Opening balance row. */}
          {(batch.openingMovements?.length ? batch.openingMovements : [null]).map(
            (om, idx) => (
              <tr key={`open-${idx}`} className="border-b bg-muted/20">
                <td className="px-4 py-2 font-mono text-xs font-medium whitespace-nowrap">
                  {batch.batchNo}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {godownLabel}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                  {/* Journal (9010) row carries the "Opening as on 1-Apr"
                      label; pre-period trail rows show their own dates; the
                      carried-forward placeholder falls back to the
                      reporting-period / FY-start date. */}
                  {om?.voucherDate
                    ? idx === 0 && om.kind === 'journal'
                      ? `Opening as on ${formatDate(om.voucherDate)}`
                      : formatDate(om.voucherDate)
                    : idx === 0
                      ? openingAsOnDate
                        ? `Opening as on ${formatDate(openingAsOnDate)}`
                        : 'Opening'
                      : ''}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                  {om?.voucherNo ?? '—'}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {om
                    ? om.kind === 'journal'
                      ? 'Opening journal'
                      : 'Pre-period'
                    : 'Opening balance'}
                </td>
                {hasSerials && (
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {om?.serialNo ?? '—'}
                  </td>
                )}
                <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-emerald-600">
                  {om
                    ? om.movementType === 'in'
                      ? `+${formatQty(om.quantity, dp, batch.unitCode)}`
                      : '—'
                    : '—'}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-orange-600">
                  {om
                    ? om.movementType === 'out'
                      ? `-${formatQty(om.quantity, dp, batch.unitCode)}`
                      : '—'
                    : '—'}
                </td>
                <td
                  className={cn(
                    'px-3 py-2 text-right font-mono tabular-nums font-semibold whitespace-nowrap',
                    idx === (batch.openingMovements?.length ?? 0) - 1 ||
                      !batch.openingMovements?.length
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {formatQty(
                    om ? om.balanceAfter : batch.openingQuantity,
                    dp,
                    batch.unitCode,
                  )}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-muted-foreground">
                  {om && om.rate > 0 ? formatAmount(om.rate) : '—'}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-muted-foreground">
                  {om ? formatAmount(om.amount) : '—'}
                </td>
                <td className="px-4 py-2 text-xs text-muted-foreground">
                  {om?.remarks ?? (idx === 0 ? 'Brought forward' : '')}
                </td>
              </tr>
            ),
          )}
          {/* The opening trail's last row already shows the opening balance as
              on the period start (balanceAfter) — no extra summary row, it
              would just repeat the same number. */}
          {batch.movements.map((mv, idx) => (
            <MovementRow
              key={idx}
              mv={mv}
              dp={dp}
              unit={batch.unitCode}
              showSerial={hasSerials}
              batchNo={batch.batchNo}
              godown={godownLabel}
            />
          ))}
          <tr className="border-t-2 border-primary/30 bg-primary/[0.04] font-semibold">
            <td className="px-4 py-2 text-primary" colSpan={5}>
              Closing balance
            </td>
            {hasSerials && <td className="px-3 py-2" />}
            <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-emerald-600">
              {batch.inwardQuantity > 0
                ? `+${formatQty(batch.inwardQuantity, dp, batch.unitCode)}`
                : '—'}
            </td>
            <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-orange-600">
              {batch.outwardQuantity > 0
                ? `-${formatQty(batch.outwardQuantity, dp, batch.unitCode)}`
                : '—'}
            </td>
            <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-primary">
              {formatQty(batch.closingQuantity, dp, batch.unitCode)}
            </td>
            <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-muted-foreground">
              {batch.averageRate > 0 ? formatAmount(batch.averageRate) : '—'}
            </td>
            <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-muted-foreground">
              {formatAmount(batch.closingValue)}
            </td>
            <td className="px-4 py-2" />
          </tr>
        </tbody>
      </table>
      {batch.movements.length === 0 && (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          No movements in the selected window — balance carried from opening.
        </div>
      )}
    </div>
  )
}

function MovementRow({
  mv,
  dp,
  unit,
  showSerial,
  batchNo,
  godown,
}: {
  mv: BatchMovement
  dp: number
  unit: string | null
  showSerial: boolean
  batchNo: string
  godown: string
}) {
  const isIn = mv.movementType === 'in'
  return (
    <tr className="border-b last:border-0 hover:bg-muted/20">
      <td className="px-4 py-2 font-mono text-xs font-medium whitespace-nowrap">
        {batchNo}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">{godown}</td>
      <td className="px-4 py-2 whitespace-nowrap">
        {formatDate(mv.voucherDate)}
      </td>
      <td className="px-3 py-2 font-medium">{mv.voucherNo ?? '—'}</td>
      <td className="px-3 py-2">
        <Badge variant="outline" className="text-[11px]">
          {mv.voucherTypeName ?? 'Voucher'}
        </Badge>
      </td>
      {showSerial && (
        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
          {mv.serialNo ?? '—'}
        </td>
      )}
      <td
        className={cn(
          'px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap',
          isIn ? 'text-emerald-600' : 'text-muted-foreground',
        )}
      >
        {isIn ? `+${formatQty(mv.quantity, dp, unit)}` : '—'}
      </td>
      <td
        className={cn(
          'px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap',
          !isIn ? 'text-orange-600' : 'text-muted-foreground',
        )}
      >
        {!isIn ? `-${formatQty(mv.quantity, dp, unit)}` : '—'}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap font-semibold">
        {formatQty(mv.runningBalance, dp, unit)}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-muted-foreground">
        {mv.rate > 0 ? formatAmount(mv.rate) : '—'}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
        {mv.amount > 0 ? formatAmount(mv.amount) : '—'}
      </td>
      <td className="max-w-[220px] truncate px-4 py-2 text-muted-foreground">
        {mv.remarks ?? '—'}
      </td>
    </tr>
  )
}
