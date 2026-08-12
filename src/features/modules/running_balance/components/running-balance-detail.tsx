import { Fragment } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import {
  IconArrowLeft,
  IconArrowUpRight,
  IconArrowDownRight,
  IconBuildingWarehouse,
  IconFileInvoice,
} from '@tabler/icons-react'
import type { RunningBalanceDetail } from '../data/schema'
import { formatQty } from '@/utils/format-num'
import { useQuantityDecimals } from '@/hooks/use-quantity-decimals'
import { date_format } from '@/utils/removeEmptyStrings'

interface RunningBalanceDetailProps {
  data: RunningBalanceDetail
  onBack: () => void
  godownId?: number | null
}

export default function RunningBalanceDetailView({
  data,
  onBack,
  godownId,
}: RunningBalanceDetailProps) {
  const godownName =
    godownId && data.transactions.length > 0
      ? data.transactions
          .flatMap((t) => t.godownDetails ?? [])
          .find((gd) => gd.godownId === godownId)?.godownName
      : null
  const navigate = useNavigate()
  const {
    item,
    transactions,
    openingQuantity,
    totalInward,
    totalOutward,
    closingQuantity,
  } = data
  const dp = useQuantityDecimals(item.noOfDecimalPlaces)

  // Prepare chart data - limit to last 20 transactions for readability
  const chartData = transactions.slice(-15).map((t) => ({
    name: t.isOpening
      ? 'Opening'
      : t.voucherType?.substring(0, 8) + '...' || `V${t.voucherNo}`,
    Inward: t.inwardQuantity,
    Outward: t.outwardQuantity,
    Running: t.runningBalance,
  }))

  const handleVoucherClick = (
    voucherId: number | null,
    voucherType: string,
  ) => {
    if (!voucherId) return
    const typeSlug = voucherType?.toLowerCase().replace(/\s+/g, '_')
    navigate({
      to: `/transactions/vouchers/${typeSlug}/${voucherId}`,
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="-ml-2"
            >
              <IconArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">
              {item.itemName}
            </h2>
            {item.unitCode && (
              <Badge variant="secondary" className="text-xs">
                {item.unitCode}
              </Badge>
            )}
            {godownName && (
              <Badge
                variant="outline"
                className="border-blue-300 text-blue-700 dark:text-blue-400 text-xs"
              >
                {godownName} only
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Running Balance:{' '}
            <span className="font-semibold text-foreground">
              {formatQty(closingQuantity, dp)} {item.unitCode}
            </span>
            {' · '}
            {transactions.length} transactions
            {godownId && ' · Filtered by godown'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Opening
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatQty(openingQuantity, dp)}{' '}
              <span className="text-sm font-normal">{item.unitCode}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Inward
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center gap-1 text-lg font-bold text-green-600 dark:text-green-400">
              <IconArrowUpRight className="h-4 w-4" />
              {formatQty(totalInward, dp)}{' '}
              <span className="text-sm font-normal">{item.unitCode}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Outward
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center gap-1 text-lg font-bold text-red-600 dark:text-red-400">
              <IconArrowDownRight className="h-4 w-4" />
              {formatQty(totalOutward, dp)}{' '}
              <span className="text-sm font-normal">{item.unitCode}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 dark:border-purple-900">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Closing Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatQty(closingQuantity, dp)}{' '}
              <span className="text-sm font-normal">{item.unitCode}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Stock Movement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Inward" fill="#22c55e" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Outward" fill="#ef4444" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Running" fill="#a855f7" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Transaction Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                <tr className="border-b">
                  <th className="p-2 text-left font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="p-2 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="p-2 text-left font-medium text-muted-foreground">
                    Voucher
                  </th>
                  <th className="p-2 text-right font-medium text-muted-foreground">
                    Inward
                  </th>
                  <th className="p-2 text-right font-medium text-muted-foreground">
                    Outward
                  </th>
                  <th className="p-2 text-right font-medium text-muted-foreground">
                    Running Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => {
                  const prevBalance =
                    idx > 0 ? transactions[idx - 1].runningBalance : 0
                  const isIncrease = tx.runningBalance > prevBalance
                  const isDecrease = tx.runningBalance < prevBalance

                  // Godowns with batch/serial detail lines (e.g. SKADJ physical-count
                  // adjustments) — rendered as an expandable detail row under the
                  // transaction. Godowns without detail lines are skipped entirely.
                  const godownDetails =
                    tx.godownDetails?.filter(
                      (gd) => (gd.detailLines?.length ?? 0) > 0,
                    ) ?? []

                  return (
                    <Fragment key={`${tx.voucherId ?? 'opening'}-${idx}`}>
                      <tr
                        className={cn(
                          'border-b last:border-0 transition-colors',
                          tx.isOpening && 'bg-blue-50/30 dark:bg-blue-950/10',
                          !tx.isOpening && 'hover:bg-accent/30 cursor-pointer',
                        )}
                        onClick={() =>
                          !tx.isOpening &&
                          handleVoucherClick(tx.voucherId, tx.voucherType)
                        }
                      >
                        <td className="p-2 text-xs text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {tx.isOpening ? (
                            <span className="text-xs font-medium text-blue-600">
                              Opening
                            </span>
                          ) : (
                            <span className="text-xs">
                              {tx.voucherDate
                                ? date_format(tx.voucherDate)
                                : '-'}
                            </span>
                          )}
                        </td>
                        <td className="p-2">
                          {tx.isOpening ? (
                            <span className="font-medium">Opening Balance</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <IconFileInvoice className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-xs font-medium">
                                {tx.voucherType}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                #{tx.voucherNo}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-right font-mono text-green-600">
                          {tx.inwardQuantity > 0
                            ? '+' + formatQty(tx.inwardQuantity, dp)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-red-600">
                          {tx.outwardQuantity > 0
                            ? '-' + formatQty(tx.outwardQuantity, dp)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono font-semibold">
                          <span
                            className={cn(
                              isIncrease && 'text-green-600',
                              isDecrease && 'text-red-600',
                            )}
                          >
                            {formatQty(tx.runningBalance, dp)}
                          </span>
                        </td>
                      </tr>
                      {godownDetails.length > 0 && (
                        <tr className="border-b bg-muted/30">
                          <td colSpan={6} className="p-2">
                            <div className="space-y-2 pl-6">
                              {godownDetails.map((gd) => (
                                <div
                                  key={`${gd.godownId}-${idx}`}
                                  className="text-xs"
                                >
                                  <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground/80">
                                    <IconBuildingWarehouse className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    <span>
                                      {gd.godownName ??
                                        `Godown #${gd.godownId}`}
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {gd.detailLines?.map((line, lineIdx) => (
                                      <div
                                        key={`${line.batchNo}-${line.serialNo}-${lineIdx}`}
                                        className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-muted-foreground"
                                      >
                                        <span className="font-mono font-semibold text-foreground/70">
                                          {line.batchNo ?? 'No batch'}
                                        </span>
                                        {line.serialNo && (
                                          <span className="font-mono">
                                            {line.serialNo}
                                          </span>
                                        )}
                                        <span
                                          className={cn(
                                            'font-semibold uppercase',
                                            line.movementType === 'out'
                                              ? 'text-red-600'
                                              : 'text-green-600',
                                          )}
                                        >
                                          {line.movementType === 'out'
                                            ? 'OUT'
                                            : 'IN'}
                                        </span>
                                        <span className="tabular-nums">
                                          {formatQty(line.quantity, dp)}
                                        </span>
                                        {line.rate != null && (
                                          /* Rate always shows exactly 2 decimal places. */
                                          <span>@ {line.rate.toFixed(2)}</span>
                                        )}
                                        {line.amount != null && (
                                          <span className="tabular-nums">
                                            {line.amount.toLocaleString(
                                              'en-IN',
                                              {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              },
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Formula Card */}
      <Card className="bg-muted/30">
        <CardContent className="flex items-center justify-center gap-2 py-3 text-sm">
          <span className="font-medium">Opening</span>
          <span className="font-mono">{formatQty(openingQuantity, dp)}</span>
          <span className="text-muted-foreground">+</span>
          <span className="font-medium text-green-600">Inward</span>
          <span className="font-mono text-green-600">
            {formatQty(totalInward, dp)}
          </span>
          <span className="text-muted-foreground">-</span>
          <span className="font-medium text-red-600">Outward</span>
          <span className="font-mono text-red-600">
            {formatQty(totalOutward, dp)}
          </span>
          <span className="text-muted-foreground">=</span>
          <span className="font-bold text-purple-600">Closing</span>
          <span className="font-mono font-bold text-purple-600">
            {formatQty(closingQuantity, dp)}
          </span>
          <span className="text-xs text-muted-foreground">{item.unitCode}</span>
        </CardContent>
      </Card>
    </div>
  )
}
