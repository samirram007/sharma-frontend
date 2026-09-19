import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatQty } from '@/utils/format-num'
import {
  IconAlertTriangle,
  IconBuildingWarehouse,
  IconCalendarMonth,
  IconCircleCheck,
  IconCoins,
  IconGauge,
  IconHistory,
  IconListDetails,
  IconPackage,
  IconScale,
  IconTable,
} from '@tabler/icons-react'
import { useState } from 'react'
import { BatchLifelinePanel } from './batch-lifeline-panel'
import { BatchMovementTable } from './batch-movement-table'
import { formatAmount, formatDate, formatDayCount } from './format'
import { ISSUE_META, batchSeverity, groupByVoucherType, issuesOf } from './views'
import type { BatchBalance } from './data/schema'

const TONE_CLASSES: Record<string, string> = {
  danger: 'border-destructive/40 bg-destructive/[0.06]',
  warning: 'border-amber-500/40 bg-amber-500/[0.06]',
  neutral: 'border-border bg-muted/30',
  success: 'border-emerald-500/40 bg-emerald-500/[0.06]',
}

/**
 * Side panel that inspects one batch in depth: the full movement trail, how
 * the closing balance is valued, the reconciliation flags with what to check
 * next, and what each voucher type contributed to the batch.
 */
export function BatchInspector({
  batch,
  open,
  onOpenChange,
  openingAsOnDate,
  ageingAsOnDate,
}: {
  batch: BatchBalance | null
  open: boolean
  onOpenChange: (open: boolean) => void
  openingAsOnDate?: string | null
  ageingAsOnDate?: string | null
}) {
  // Controlled so the Lifeline tab can fetch only while it is visible.
  const [tab, setTab] = useState('trail')
  const dp = batch?.noOfDecimalPlaces ?? 2
  const issues = batch ? issuesOf(batch) : []
  const severity = batch ? batchSeverity(batch) : 'neutral'
  const contributions = batch ? groupByVoucherType([batch]) : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-3xl"
      >
        {batch && (
          <>
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="flex flex-wrap items-center gap-2 text-base">
                <IconPackage className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="break-words">{batch.itemName}</span>
                {batch.itemCode && (
                  <span className="font-mono text-xs font-normal text-muted-foreground">
                    {batch.itemCode}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className="shrink-0 font-mono text-[11px]"
                >
                  BatchNo: {batch.batchNo}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 text-[11px]',
                    TONE_CLASSES[severity],
                  )}
                >
                  {severity === 'danger'
                    ? 'Needs attention'
                    : severity === 'warning'
                      ? 'Check opening'
                      : 'Reconciled'}
                </Badge>
              </SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <IconBuildingWarehouse className="h-3.5 w-3.5" />
                  {batch.godownName ?? `Godown #${batch.godownId}`}
                </span>
                <span className="font-mono tabular-nums text-foreground">
                  Closing {formatQty(batch.closingQuantity, dp, batch.unitCode)}
                </span>
                <span className="font-mono tabular-nums text-foreground">
                  Value {formatAmount(batch.closingValue)}
                </span>
                {batch.expiryDate && (
                  <span>
                    Expires {formatDate(batch.expiryDate)}
                    {batch.daysToExpiry != null
                      ? ` (${formatDayCount(batch.daysToExpiry)})`
                      : ''}
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>

            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <div className="border-b px-5 pt-3">
                <TabsList>
                  <TabsTrigger value="trail" className="gap-1.5">
                    <IconListDetails className="h-3.5 w-3.5" />
                    Trail
                  </TabsTrigger>
                  <TabsTrigger value="lifeline" className="gap-1.5">
                    <IconHistory className="h-3.5 w-3.5" />
                    Lifeline
                  </TabsTrigger>
                  <TabsTrigger value="valuation" className="gap-1.5">
                    <IconScale className="h-3.5 w-3.5" />
                    Valuation
                  </TabsTrigger>
                  <TabsTrigger value="issues" className="gap-1.5">
                    <IconGauge className="h-3.5 w-3.5" />
                    Reconciliation
                    {issues.length > 0 && (
                      <Badge
                        variant="outline"
                        className="ml-1 px-1.5 py-0 text-[10px]"
                      >
                        {issues.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="vouchers" className="gap-1.5">
                    <IconTable className="h-3.5 w-3.5" />
                    Voucher types
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="trail" className="mt-0">
                <BatchMovementTable
                  batch={batch}
                  openingAsOnDate={openingAsOnDate}
                />
              </TabsContent>

              <TabsContent value="lifeline" className="mt-0">
                <BatchLifelinePanel batch={batch} enabled={tab === 'lifeline'} />
              </TabsContent>

              <TabsContent value="valuation" className="mt-0 space-y-4 p-5">
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-2 text-left font-medium">
                            Stage
                          </th>
                          <th className="px-3 py-2 text-right font-medium">
                            Qty
                          </th>
                          <th className="px-3 py-2 text-right font-medium">
                            Rate
                          </th>
                          <th className="px-4 py-2 text-right font-medium">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <ValuationRow
                          label="Opening"
                          qty={batch.openingQuantity}
                          value={batch.openingValue}
                          dp={dp}
                          unit={batch.unitCode}
                        />
                        <ValuationRow
                          label="Inward"
                          qty={batch.inwardQuantity}
                          value={batch.inwardValue}
                          dp={dp}
                          unit={batch.unitCode}
                          tone="text-emerald-600"
                        />
                        <ValuationRow
                          label="Outward"
                          qty={batch.outwardQuantity}
                          value={batch.outwardValue}
                          dp={dp}
                          unit={batch.unitCode}
                          tone="text-orange-600"
                        />
                        <ValuationRow
                          label="Closing"
                          qty={batch.closingQuantity}
                          value={batch.closingValue}
                          dp={dp}
                          unit={batch.unitCode}
                          rate={batch.averageRate}
                          emphasize
                        />
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Closing value = opening + inward − outward{' '}
                    <span className="font-mono tabular-nums text-foreground">
                      {formatAmount(batch.openingValue)} +{' '}
                      {formatAmount(batch.inwardValue)} −{' '}
                      {formatAmount(batch.outwardValue)} ={' '}
                      {formatAmount(batch.closingValue)}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Average closing rate{' '}
                    <span className="font-mono tabular-nums text-foreground">
                      {formatAmount(batch.averageRate)}
                    </span>{' '}
                    per {batch.unitCode ?? 'unit'}
                    {batch.movementCount > 0
                      ? ` · valued over ${batch.movementCount} movement(s) in the window`
                      : ' · no movement in the window'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Values come from the stock journal lines ({' '}
                    quantity × rate as booked), so they follow the voucher
                    rates rather than a costing method.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="issues" className="mt-0 space-y-3 p-5">
                {issues.length === 0 ? (
                  <div className="flex items-start gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/[0.06] p-3 text-sm">
                    <IconCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-medium">No issue detected</p>
                      <p className="text-muted-foreground">
                        Opening, movement and closing quantities reconcile for
                        this batch inside the reporting window.
                      </p>
                    </div>
                  </div>
                ) : (
                  issues.map((code) => (
                    <div
                      key={code}
                      className={cn(
                        'flex items-start gap-2 rounded-md border p-3 text-sm',
                        TONE_CLASSES[ISSUE_META[code].tone],
                      )}
                    >
                      <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-medium">{ISSUE_META[code].label}</p>
                        <p className="text-muted-foreground">
                          {ISSUE_META[code].detail}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                <Card>
                  <CardContent className="space-y-2 p-4 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <IconCalendarMonth className="h-4 w-4 text-muted-foreground" />
                      Ageing
                      {ageingAsOnDate && (
                        <span className="text-xs font-normal text-muted-foreground">
                          measured as on {formatDate(ageingAsOnDate)}
                        </span>
                      )}
                    </div>
                    <DefinitionRow
                      label="Manufactured"
                      value={batch.mfgDate ? formatDate(batch.mfgDate) : '—'}
                    />
                    <DefinitionRow
                      label="Stock age"
                      value={
                        batch.daysSinceMfg == null
                          ? '—'
                          : `${batch.daysSinceMfg} day(s)`
                      }
                    />
                    <DefinitionRow
                      label="Expiry"
                      value={batch.expiryDate ? formatDate(batch.expiryDate) : '—'}
                    />
                    <DefinitionRow
                      label="Days to expiry"
                      value={
                        batch.daysToExpiry == null
                          ? '—'
                          : `${batch.daysToExpiry} (${formatDayCount(batch.daysToExpiry)})`
                      }
                    />
                    <DefinitionRow
                      label="Expiry state"
                      value={batch.expiryStatus}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-2 p-4 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <IconListDetails className="h-4 w-4 text-muted-foreground" />
                      Activity in the window
                    </div>
                    <DefinitionRow
                      label="Movements"
                      value={String(batch.movementCount)}
                    />
                    <DefinitionRow
                      label="First movement"
                      value={
                        batch.firstMovementDate
                          ? formatDate(batch.firstMovementDate)
                          : '—'
                      }
                    />
                    <DefinitionRow
                      label="Last movement"
                      value={
                        batch.lastMovementDate
                          ? formatDate(batch.lastMovementDate)
                          : '—'
                      }
                    />
                    <DefinitionRow
                      label="Opening rows listed"
                      value={String(batch.openingMovements?.length ?? 0)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vouchers" className="mt-0 space-y-3 p-5">
                {contributions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No movement trail loaded for this batch — reload the report
                    with the trail enabled.
                  </p>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                            <th className="px-4 py-2 text-left font-medium">
                              Voucher type
                            </th>
                            <th className="px-3 py-2 text-right font-medium">
                              In
                            </th>
                            <th className="px-3 py-2 text-right font-medium">
                              In value
                            </th>
                            <th className="px-3 py-2 text-right font-medium">
                              Out
                            </th>
                            <th className="px-4 py-2 text-right font-medium">
                              Out value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {contributions.map((contribution) => (
                            <tr
                              key={contribution.key}
                              className="border-b last:border-0"
                            >
                              <td className="px-4 py-2">
                                {contribution.label}
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {contribution.movementCount} line(s)
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums text-emerald-600">
                                {contribution.inward > 0
                                  ? `+${formatQty(contribution.inward, dp)}`
                                  : '—'}
                              </td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                                {formatAmount(contribution.inwardValue)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums text-orange-600">
                                {contribution.outward > 0
                                  ? `-${formatQty(contribution.outward, dp)}`
                                  : '—'}
                              </td>
                              <td className="px-4 py-2 text-right font-mono tabular-nums text-muted-foreground">
                                {formatAmount(contribution.outwardValue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                )}
                <p className="text-xs text-muted-foreground">
                  <IconCoins className="mr-1 inline h-3 w-3" />
                  Opening rows (the 9010 journal and pre-period movements) are
                  included, so the columns reconcile with the batch balances.
                </p>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function ValuationRow({
  label,
  qty,
  value,
  rate,
  dp,
  unit,
  tone,
  emphasize,
}: {
  label: string
  qty: number
  value: number
  rate?: number
  dp: number
  unit: string | null
  tone?: string
  emphasize?: boolean
}) {
  const derivedRate =
    rate != null ? rate : qty !== 0 ? Math.round((value / qty) * 10000) / 10000 : 0

  return (
    <tr className={cn('border-b last:border-0', emphasize && 'bg-primary/[0.04]')}>
      <td className={cn('px-4 py-2', emphasize && 'font-semibold text-primary')}>
        {label}
      </td>
      <td
        className={cn('px-3 py-2 text-right font-mono tabular-nums', tone, emphasize && 'font-semibold')}
      >
        {formatQty(qty, dp, unit)}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
        {derivedRate ? formatAmount(derivedRate) : '—'}
      </td>
      <td
        className={cn(
          'px-4 py-2 text-right font-mono tabular-nums',
          emphasize && 'font-semibold',
        )}
      >
        {formatAmount(value)}
      </td>
    </tr>
  )
}

function DefinitionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums capitalize">{value}</span>
    </div>
  )
}
