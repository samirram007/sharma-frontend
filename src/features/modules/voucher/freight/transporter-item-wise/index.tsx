import { useMemo, useState, useCallback } from 'react'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ChevronDownIcon,
} from '@radix-ui/react-icons'
import { DataTableToolbar } from './data-table-toolbar'
import { VoucherPaymentAction } from '../shared/utils'
import TransporterChart from './components/transporter-chart'
import type { TransporterItemWiseItem } from './data/schema'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatQty } from '@/utils/format-num'

interface TransporterItemWiseProps {
  data: Array<TransporterItemWiseItem>
  title?: string
}

export default function FreightTransporterItemWise({
  data,
  title = 'Freight (Transporter Item Wise)',
}: TransporterItemWiseProps) {
  return (
    <>
      {!data || data.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No data available.</div>
      ) : (
        <ReportView data={data} title={title} />
      )}
    </>
  )
}

const PAGE_SIZES = [10, 15, 20, 30, 50, 100]

const COLUMN_GRID =
  'grid-cols-[1.1fr_0.8fr_1.2fr_1.5fr_1fr_1fr_0.65fr_0.75fr_0.7fr_0.55fr]'

const ReportView = ({
  data,
  title,
}: {
  data: Array<TransporterItemWiseItem>
  title: string
}) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [showChart, setShowChart] = useState(false)
  const [transporterFilter, setTransporterFilter] = useState<Array<string>>([])

  // Compute grand totals
  const grandTotal = useMemo(() => {
    return data.reduce(
      (acc, transporter) => ({
        totalVouchers: acc.totalVouchers + (transporter.totalVouchers ?? 0),
        totalQuantity: acc.totalQuantity + (transporter.totalQuantity ?? 0),
        totalAmount: acc.totalAmount + (transporter.totalAmount ?? 0),
        totalEntries: acc.totalEntries + (transporter.entries?.length ?? 0),
      }),
      { totalVouchers: 0, totalQuantity: 0, totalAmount: 0, totalEntries: 0 },
    )
  }, [data])

  // Filter data based on global filter and transporter filter
  const filteredData = useMemo(() => {
    let result = data

    // Apply transporter filter first
    if (transporterFilter.length > 0) {
      result = result.filter((t) =>
        transporterFilter.includes(t.transporterName),
      )
    }

    // Then apply global search filter
    if (globalFilter) {
      const filter = globalFilter.toLowerCase()
      result = result
        .map((transporter) => {
          const matchedEntries = transporter.entries?.filter(
            (entry) =>
              entry.voucherNo?.toLowerCase().includes(filter) ||
              entry.itemName?.toLowerCase().includes(filter) ||
              entry.partyName?.toLowerCase().includes(filter) ||
              entry.source?.toLowerCase().includes(filter) ||
              entry.destination?.toLowerCase().includes(filter),
          )
          if (
            transporter.transporterName?.toLowerCase().includes(filter) ||
            transporter.vehicleNumber?.toLowerCase().includes(filter) ||
            (matchedEntries && matchedEntries.length > 0)
          ) {
            return {
              ...transporter,
              entries: matchedEntries ?? transporter.entries,
            }
          }
          return null
        })
        .filter(Boolean) as Array<TransporterItemWiseItem>
    }

    return result
  }, [data, globalFilter, transporterFilter])

  return (
    <div className="w-full min-h-full grid grid-rows-[auto_auto_1fr]">
      <DataTableToolbar
        placeHolder="Filter transporters, items or vouchers..."
        filteredRows={data}
        exportRows={filteredData}
        title={title}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        showChart={showChart}
        onToggleChart={() => setShowChart((v) => !v)}
        transporterFilter={transporterFilter}
        onTransporterFilterChange={setTransporterFilter}
      />

      {/* Chart section */}
      <div>
        {showChart && (
          <div className="px-2 py-3 border-b">
            <TransporterChart
              data={data}
              chartTitle="Transporter Wise Total Amounts"
            />
          </div>
        )}
      </div>

      {/* Report body - each transporter as a card */}
      <div className="min-h-full overflow-auto space-y-4 p-3">
        {filteredData.map((transporter, index) => (
          <TransporterSection
            key={transporter.transporterName ?? index}
            transporter={transporter}
          />
        ))}

        {/* Grand total footer */}
        {filteredData.length > 0 && (
          <div className="sticky bottom-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center justify-between px-4 py-2 text-[13px] font-bold">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
                <span className="tracking-widest uppercase text-amber-300">
                  Grand Total
                </span>
              </div>
              <span className="text-gray-300 text-xs">
                {filteredData.length} transporter
                {filteredData.length !== 1 ? 's' : ''} ·{' '}
                {grandTotal.totalVouchers} voucher
                {grandTotal.totalVouchers !== 1 ? 's' : ''}
              </span>
              <span className="text-gray-300 text-xs">
                {grandTotal.totalEntries ?? 0} line
                {grandTotal.totalEntries !== 1 ? 's' : ''}
              </span>
              <span className="text-amber-300 text-sm">
                ₹
                {(grandTotal.totalAmount ?? 0).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const TransporterSection = ({
  transporter,
}: {
  transporter: TransporterItemWiseItem
}) => {
  // Pagination for entries
  const [entryPage, setEntryPage] = useState(0)
  const [entryPageSize, setEntryPageSize] = useState(20)
  const totalEntryPages = Math.max(
    1,
    Math.ceil((transporter.entries?.length ?? 0) / entryPageSize),
  )
  const safePage = Math.min(entryPage, totalEntryPages - 1)
  const pageEntries = (transporter.entries ?? []).slice(
    safePage * entryPageSize,
    (safePage + 1) * entryPageSize,
  )

  // Track which voucher groups are visible
  const [expandedVouchers, setExpandedVouchers] = useState<
    Record<string, boolean>
  >({})

  // Group entries by voucher for display
  const voucherGroups = useMemo(() => {
    const groups: Array<{
      voucherNo: string
      voucherDate: string | null
      partyName: string
      source: string
      destination: string
      paymentStatus: string
      totalFare: number
      items: Array<(typeof pageEntries)[0]>
    }> = []
    const seen = new Map<string, number>()

    pageEntries.forEach((entry) => {
      const key = entry.voucherNo
      if (seen.has(key)) {
        groups[seen.get(key)!].items.push(entry)
      } else {
        seen.set(key, groups.length)
        groups.push({
          voucherNo: entry.voucherNo,
          voucherDate: entry.voucherDate,
          partyName: entry.partyName,
          source: entry.source,
          destination: entry.destination,
          paymentStatus: entry.paymentStatus,
          totalFare: entry.totalFare,
          items: [entry],
        })
      }
    })
    return groups
  }, [pageEntries])

  const toggleVoucher = useCallback((voucherNo: string) => {
    setExpandedVouchers((prev) => ({
      ...prev,
      [voucherNo]: !prev[voucherNo],
    }))
  }, [])

  // Auto-collapse/expand all
  const allExpanded = useMemo(() => {
    if (voucherGroups.length === 0) return false
    return voucherGroups.every(
      (g) => expandedVouchers[g.voucherNo] ?? g.items.length <= 1,
    )
  }, [voucherGroups, expandedVouchers])

  const expandAll = useCallback(() => {
    const all: Record<string, boolean> = {}
    voucherGroups.forEach((g) => {
      if (g.items.length > 1) all[g.voucherNo] = true
    })
    setExpandedVouchers(all)
  }, [voucherGroups])

  const collapseAll = useCallback(() => {
    setExpandedVouchers({})
  }, [])

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
      {/* Transporter header row */}
      <div className="rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 shrink-0">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-wide truncate">
              {transporter.transporterName || 'Unknown Transporter'}
            </span>
            {transporter.vehicleNumber && (
              <span className="text-[11px] text-blue-200 font-mono bg-white/10 px-1.5 py-0.5 rounded shrink-0">
                🚛 {transporter.vehicleNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="text-blue-200">
              {transporter.totalVouchers ?? '-'} voucher
              {transporter.totalVouchers !== 1 ? 's' : ''}
            </span>
            <span className="text-blue-200">
              Qty:{' '}
              <span className="text-white font-semibold">
                {formatQty(
                  transporter.totalQuantity,
                  transporter.entries?.[0]?.noOfDecimalPlaces,
                )}
              </span>
            </span>
            <span className="text-white font-bold text-sm">
              ₹
              {(transporter.totalAmount ?? 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Entry table */}
      <div className="bg-white">
        {/* Column header */}
        <div
          className={cn(
            `grid ${COLUMN_GRID} text-[11px] font-semibold bg-gray-100 border-b-2 border-gray-300`,
          )}
        >
          <div className="pl-2 py-1.5 text-left text-gray-600 flex items-center gap-1">
            Vch No
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={allExpanded ? collapseAll : expandAll}
              title={
                allExpanded
                  ? 'Collapse all voucher groups'
                  : 'Expand all voucher groups'
              }
            >
              <ChevronDownIcon
                className={`h-3 w-3 transition-transform ${allExpanded ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>
          </div>
          <div className="border-l border-gray-200 pl-1.5 py-1.5 text-left text-gray-600">
            Date
          </div>
          <div className="border-l border-gray-200 pl-1.5 py-1.5 text-left text-gray-600">
            Party
          </div>
          <div className="border-l border-gray-200 pl-1.5 py-1.5 text-left text-gray-600">
            Item
          </div>
          <div className="border-l border-gray-200 pl-1.5 py-1.5 text-left text-gray-600">
            Source
          </div>
          <div className="border-l border-gray-200 pl-1.5 py-1.5 text-left text-gray-600">
            Destination
          </div>
          <div className="border-l border-gray-200 py-1.5 text-right pr-1 text-gray-600">
            Qty
          </div>
          <div className="border-l border-gray-200 py-1.5 text-right pr-1 text-gray-600">
            Amount
          </div>
          <div className="border-l border-gray-200 py-1.5 text-center text-gray-600">
            Status
          </div>
          <div className="border-l border-gray-200 py-1.5 text-center text-gray-600"></div>
        </div>

        {/* Voucher groups */}
        {voucherGroups.map((group, groupIndex) => {
          const isExpanded =
            expandedVouchers[group.voucherNo] ?? group.items.length <= 1
          const displayItems = isExpanded
            ? group.items
            : group.items.slice(0, 1)
          const hasMoreItems = group.items.length > 1

          return (
            <div
              key={group.voucherNo}
              className={cn(
                'border-b border-gray-100 last:border-b-0 transition-colors',
                groupIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30',
              )}
            >
              {displayItems.map((entry, entryIndex) => {
                const isFirstInGroup = entryIndex === 0
                const isItemRow = !isFirstInGroup

                return (
                  <div
                    key={`${group.voucherNo}-${entry.itemName}-${entryIndex}`}
                    className={cn(
                      `grid ${COLUMN_GRID} text-[12px] items-center transition-colors duration-150`,
                      isItemRow
                        ? 'bg-gray-50/40 hover:bg-blue-50/40'
                        : 'hover:bg-gray-50',
                    )}
                  >
                    {/* Vch No */}
                    <div className="pl-2 py-1 text-left font-mono font-semibold text-gray-700 truncate flex items-center gap-1">
                      {isFirstInGroup && hasMoreItems && (
                        <button
                          className="flex items-center justify-center w-4 h-4 rounded text-[9px] text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none cursor-pointer transition-all"
                          onClick={() => toggleVoucher(group.voucherNo)}
                          title={
                            isExpanded
                              ? 'Collapse items'
                              : `Show all ${group.items.length} items`
                          }
                        >
                          <ChevronDownIcon
                            className={cn(
                              'h-3 w-3 transition-transform duration-200',
                              isExpanded ? 'rotate-0' : '-rotate-90',
                            )}
                          />
                        </button>
                      )}
                      {!hasMoreItems && isFirstInGroup && (
                        <span className="w-4 shrink-0" />
                      )}
                      <span
                        className={cn(
                          isFirstInGroup
                            ? 'text-gray-800 font-bold'
                            : 'text-gray-300',
                          'truncate',
                        )}
                      >
                        {isFirstInGroup ? entry.voucherNo : ''}
                      </span>
                      {isFirstInGroup && hasMoreItems && (
                        <span className="text-[9px] text-gray-400 font-normal ml-1 bg-gray-100 px-1 rounded">
                          {group.items.length}
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="border-l border-gray-100 pl-1.5 py-1 text-left text-gray-400 text-[11px] truncate">
                      {isFirstInGroup && entry.voucherDate
                        ? formatDDMMMYYYY(entry.voucherDate)
                        : ''}
                    </div>

                    {/* Party */}
                    <div
                      className="border-l border-gray-100 pl-1.5 py-1 text-gray-600 truncate text-[11px]"
                      title={isFirstInGroup ? entry.partyName : ''}
                    >
                      {isFirstInGroup ? (
                        <span className="font-medium text-gray-700">
                          {entry.partyName}
                        </span>
                      ) : (
                        ''
                      )}
                    </div>

                    {/* Item Name */}
                    <div
                      className="border-l border-gray-100 pl-1.5 py-1 text-gray-700 truncate text-[12px] font-medium"
                      title={entry.itemName}
                    >
                      <span className="inline-flex items-center gap-1">
                        {isItemRow && (
                          <span className="w-1 h-1 rounded-full bg-blue-300 shrink-0" />
                        )}
                        {entry.itemName}
                      </span>
                      {entry.unitCode && (
                        <span className="text-[10px] text-gray-400 ml-1 font-normal">
                          {entry.unitCode}
                        </span>
                      )}
                    </div>

                    {/* Source */}
                    <div className="border-l border-gray-100 pl-1.5 py-1 text-gray-500 truncate text-[11px]">
                      {isFirstInGroup ? entry.source : ''}
                    </div>

                    {/* Destination */}
                    <div className="border-l border-gray-100 pl-1.5 py-1 text-gray-500 truncate text-[11px]">
                      {isFirstInGroup ? entry.destination : ''}
                    </div>

                    {/* Qty */}
                    <div className="border-l border-gray-100 py-1 text-right pr-1.5 text-gray-800 font-mono text-[12px] font-medium tabular-nums">
                      {formatQty(entry.actualQuantity, entry.noOfDecimalPlaces)}
                    </div>

                    {/* Amount */}
                    <div className="border-l border-gray-100 py-1 text-right pr-1.5 text-gray-800 font-mono text-[12px] font-semibold tabular-nums">
                      <span className="text-[10px] text-gray-400">₹</span>
                      {(entry.amount ?? 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>

                    {/* Status */}
                    <div className="border-l border-gray-100 py-1 flex justify-center">
                      {isFirstInGroup && entry.paymentStatus ? (
                        <span
                          className={cn(
                            'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none',
                            entry.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : entry.paymentStatus === 'partially_paid'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200',
                          )}
                        >
                          {entry.paymentStatus === 'paid'
                            ? 'Paid'
                            : entry.paymentStatus === 'partially_paid'
                              ? 'Partial'
                              : 'Unpaid'}
                        </span>
                      ) : (
                        <span className="text-gray-200">—</span>
                      )}
                    </div>

                    {/* Action */}
                    <div className="border-l border-gray-100 py-1 flex justify-center">
                      {isFirstInGroup ? (
                        <VoucherPaymentAction
                          detail={
                            {
                              voucherId: entry.voucherId,
                              voucherNo: entry.voucherNo,
                              voucherDate: entry.voucherDate ?? '',
                              partyName: entry.partyName ?? '',
                              amount: group.items.reduce(
                                (sum, i) => sum + (i.amount ?? 0),
                                0,
                              ),
                              paymentStatus: entry.paymentStatus ?? 'unpaid',
                            } as any
                          }
                        />
                      ) : null}
                    </div>
                  </div>
                )
              })}

              {/* Collapsed state hint */}
              {!isExpanded && hasMoreItems && (
                <div
                  className="cursor-pointer bg-gradient-to-r from-blue-50/60 to-transparent hover:from-blue-100/80 text-[11px] text-blue-600 text-center py-1 border-t border-blue-100/50 transition-colors font-medium"
                  onClick={() => toggleVoucher(group.voucherNo)}
                >
                  + {group.items.length - 1} more item
                  {group.items.length - 1 !== 1 ? 's' : ''} · Click to expand
                </div>
              )}

              {/* Item summary row for this voucher */}
              {isExpanded && group.items.length > 1 && (
                <div
                  className={cn(
                    `grid ${COLUMN_GRID} text-[11px] font-medium bg-blue-50/70 border-t border-blue-100`,
                  )}
                >
                  <div className="pl-2 py-1 text-blue-600 italic text-[10px] flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-blue-400" />
                    {group.items.length} items
                  </div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div className="text-right pr-1.5 text-blue-700 font-mono font-semibold tabular-nums">
                    {formatQty(
                      group.items.reduce(
                        (sum, i) => sum + (i.actualQuantity ?? 0),
                        0,
                      ),
                      group.items[0]?.noOfDecimalPlaces,
                    )}
                  </div>
                  <div className="text-right pr-1.5 text-blue-700 font-mono font-semibold tabular-nums">
                    <span className="text-[9px] text-blue-400">₹</span>
                    {group.items
                      .reduce((sum, i) => sum + (i.amount ?? 0), 0)
                      .toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </div>
                  <div></div>
                  <div></div>
                </div>
              )}
            </div>
          )
        })}

        {/* No entries message */}
        {(!transporter.entries || transporter.entries.length === 0) && (
          <div className="text-center text-gray-400 py-6 text-xs">
            No entries found for this transporter.
          </div>
        )}

        {/* Entry pagination footer */}
        {(transporter.entries?.length ?? 0) > entryPageSize && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t border-gray-200">
            <span className="text-[10px] text-gray-500">
              Showing {safePage * entryPageSize + 1}–
              {Math.min(
                (safePage + 1) * entryPageSize,
                transporter.entries?.length ?? 0,
              )}{' '}
              of {transporter.entries?.length ?? 0} entries
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-600">Rows</span>
                <Select
                  value={`${entryPageSize}`}
                  onValueChange={(value) => {
                    setEntryPageSize(Number(value))
                    setEntryPage(0)
                  }}
                >
                  <SelectTrigger className="h-5 w-[52px] text-[10px]">
                    <SelectValue placeholder={entryPageSize} />
                  </SelectTrigger>
                  <SelectContent side="bottom">
                    {PAGE_SIZES.map((size) => (
                      <SelectItem
                        key={size}
                        value={`${size}`}
                        className="text-[10px]"
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  className="h-5 w-5 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  onClick={() => setEntryPage(0)}
                  disabled={safePage === 0}
                >
                  <DoubleArrowLeftIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  className="h-5 w-5 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  onClick={() => setEntryPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                >
                  <ChevronLeftIcon className="h-3 w-3" />
                </Button>
                <span className="text-[10px] text-gray-600 min-w-[3rem] text-center font-mono">
                  {safePage + 1}/{totalEntryPages}
                </span>
                <Button
                  variant="ghost"
                  className="h-5 w-5 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  onClick={() =>
                    setEntryPage((p) => Math.min(totalEntryPages - 1, p + 1))
                  }
                  disabled={safePage >= totalEntryPages - 1}
                >
                  <ChevronRightIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  className="h-5 w-5 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  onClick={() => setEntryPage(totalEntryPages - 1)}
                  disabled={safePage >= totalEntryPages - 1}
                >
                  <DoubleArrowRightIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transporter summary footer */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
        <div className="flex items-center justify-between px-3 py-1.5 text-[12px] font-semibold text-blue-800">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-blue-400 rounded-full" />
            <span className="tracking-wide">
              {transporter.transporterName || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-blue-600">
            <span>
              Qty:{' '}
              <span className="text-blue-800 font-bold">
                {formatQty(
                  transporter.totalQuantity,
                  transporter.entries?.[0]?.noOfDecimalPlaces,
                )}
              </span>
            </span>
            <span className="text-blue-300">|</span>
            <span>
              {transporter.totalVouchers ?? 0} voucher
              {transporter.totalVouchers !== 1 ? 's' : ''}
            </span>
            <span className="text-blue-300">|</span>
            <span className="text-blue-800 font-bold">
              ₹
              {(transporter.totalAmount ?? 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const formatDDMMMYYYY = (value: string | Date) => {
  const date = new Date(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}
