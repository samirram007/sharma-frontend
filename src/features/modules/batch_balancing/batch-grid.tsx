import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatQty } from '@/utils/format-num'
import {
  IconArrowsSort,
  IconLayoutGrid,
  IconPackage,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { formatAmount, formatDate, formatDayCount } from './format'
import { ISSUE_META, batchSeverity, issuesOf } from './views'
import type { BatchSortBy, BatchSortDir } from './data/api'
import type { BatchBalance } from './data/schema'

const STORAGE_KEY = 'batch-balancing-grid-columns'

interface GridColumn {
  id: string
  header: string
  align: 'left' | 'right'
  sortBy?: BatchSortBy
  render: (batch: BatchBalance) => ReactNode
  /** Always visible (batch identity). */
  locked?: boolean
  defaultHidden?: boolean
}

const COLUMNS: GridColumn[] = [
  {
    id: 'batch',
    header: 'Batch no',
    align: 'left',
    sortBy: 'batch',
    locked: true,
    render: (b) => (
      <span className="font-mono text-xs font-medium">{b.batchNo}</span>
    ),
  },
  {
    id: 'item',
    header: 'Item',
    align: 'left',
    sortBy: 'item',
    render: (b) => (
      <div className="min-w-0">
        <div className="truncate font-medium">{b.itemName}</div>
        {b.itemCode ? (
          <div className="truncate font-mono text-[11px] text-muted-foreground">
            {b.itemCode}
          </div>
        ) : null}
      </div>
    ),
  },
  {
    id: 'godown',
    header: 'Godown',
    align: 'left',
    sortBy: 'godown',
    render: (b) => (
      <span className="truncate">
        {b.godownName ?? `Godown #${b.godownId}`}
      </span>
    ),
  },
  {
    id: 'expiry',
    header: 'Expiry',
    align: 'left',
    sortBy: 'expiry',
    render: (b) =>
      b.expiryDate ? (
        <span
          className={cn(
            'whitespace-nowrap text-xs',
            b.expiryStatus === 'expired'
              ? 'font-medium text-destructive'
              : b.expiryStatus === 'expiring'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground',
          )}
        >
          {formatDate(b.expiryDate)}
          {b.daysToExpiry != null ? ` · ${formatDayCount(b.daysToExpiry)}` : ''}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    id: 'opening',
    header: 'Opening',
    align: 'right',
    sortBy: 'opening',
    defaultHidden: true,
    render: (b) => (
      <span className="font-mono tabular-nums">
        {formatQty(b.openingQuantity, b.noOfDecimalPlaces)}
      </span>
    ),
  },
  {
    id: 'inward',
    header: 'Inward',
    align: 'right',
    sortBy: 'inward',
    render: (b) =>
      b.inwardQuantity > 0 ? (
        <span className="font-mono tabular-nums text-emerald-600">
          +{formatQty(b.inwardQuantity, b.noOfDecimalPlaces)}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: 'outward',
    header: 'Outward',
    align: 'right',
    sortBy: 'outward',
    render: (b) =>
      b.outwardQuantity > 0 ? (
        <span className="font-mono tabular-nums text-orange-600">
          -{formatQty(b.outwardQuantity, b.noOfDecimalPlaces)}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: 'closing',
    header: 'Closing',
    align: 'right',
    sortBy: 'closing',
    render: (b) => (
      <span
        className={cn(
          'font-mono tabular-nums font-semibold',
          b.closingQuantity < 0 ? 'text-destructive' : 'text-primary',
        )}
      >
        {formatQty(b.closingQuantity, b.noOfDecimalPlaces, b.unitCode)}
      </span>
    ),
  },
  {
    id: 'averageRate',
    header: 'Avg rate',
    align: 'right',
    defaultHidden: true,
    render: (b) => (
      <span className="font-mono tabular-nums text-muted-foreground">
        {b.averageRate > 0 ? formatAmount(b.averageRate) : '—'}
      </span>
    ),
  },
  {
    id: 'value',
    header: 'Closing value',
    align: 'right',
    sortBy: 'value',
    render: (b) => (
      <span
        className={cn(
          'font-mono tabular-nums',
          b.closingValue < 0 && 'text-destructive',
        )}
      >
        {formatAmount(b.closingValue)}
      </span>
    ),
  },
  {
    id: 'movements',
    header: 'Movements',
    align: 'right',
    sortBy: 'activity',
    defaultHidden: true,
    render: (b) => (
      <span className="font-mono tabular-nums text-muted-foreground">
        {b.movementCount}
      </span>
    ),
  },
  {
    id: 'lastMovement',
    header: 'Last movement',
    align: 'left',
    defaultHidden: true,
    render: (b) => (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {b.lastMovementDate ? formatDate(b.lastMovementDate) : '—'}
      </span>
    ),
  },
  {
    id: 'flags',
    header: 'Flags',
    align: 'left',
    render: (b) => {
      const issues = issuesOf(b)
      if (issues.length === 0) {
        return (
          <span className="text-xs text-muted-foreground">reconciled</span>
        )
      }

      return (
        <div className="flex flex-wrap gap-1">
          {issues.map((code) => (
            <Badge
              key={code}
              variant="outline"
              title={ISSUE_META[code].detail}
              className={cn(
                'px-1.5 py-0 text-[10px]',
                code === 'negativeClosing'
                  ? 'border-destructive/40 bg-destructive/10 text-destructive'
                  : code === 'noMovement'
                    ? 'border-border bg-muted/40 text-muted-foreground'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
              )}
            >
              {ISSUE_META[code].label}
            </Badge>
          ))}
        </div>
      )
    },
  },
]

/** Hidden column ids persisted per browser. */
function loadHidden(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return COLUMNS.filter((c) => c.defaultHidden).map((c) => c.id)
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id) => typeof id === 'string')
  } catch {
    return []
  }
}

/**
 * Dense, sortable table of the batches on the current page — the "scan
 * everything" companion to the card views. Sorting is delegated to the server
 * (the backend sorts whole result sets, not just the page), column visibility
 * is remembered per browser, and rows support keyboard navigation with Enter
 * opening the inspector.
 */
export function BatchGrid({
  batches,
  sortBy,
  sortDir,
  onSort,
  onInspect,
}: {
  batches: BatchBalance[]
  sortBy: BatchSortBy
  sortDir: BatchSortDir
  /** Toggle sorting for a column — the page refetches with the new order. */
  onSort: (column: BatchSortBy) => void
  onInspect: (batch: BatchBalance) => void
}) {
  const [hidden, setHidden] = useState<string[]>([])
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])

  // Read the persisted column choice after mount (localStorage is not
  // available while the route module is evaluated).
  useEffect(() => {
    setHidden(loadHidden())
  }, [])

  const persist = useCallback((next: string[]) => {
    setHidden(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Persisting is best-effort — the view still works for this session.
    }
  }, [])

  const visibleColumns = COLUMNS.filter(
    (column) => column.locked || !hidden.includes(column.id),
  )

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    index: number,
  ) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next =
        event.key === 'ArrowDown'
          ? Math.min(index + 1, batches.length - 1)
          : Math.max(index - 1, 0)
      rowRefs.current[next]?.focus()
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onInspect(batches[index])
    } else if (event.key === 'Home') {
      event.preventDefault()
      rowRefs.current[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      rowRefs.current[batches.length - 1]?.focus()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 print:hidden">
        <p className="text-xs text-muted-foreground">
          {batches.length} batch{batches.length === 1 ? '' : 'es'} on this page
          {' · '}click a row (or press Enter) to inspect it
        </p>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <IconLayoutGrid className="mr-1.5 h-3.5 w-3.5" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs font-medium">
              Visible columns
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {COLUMNS.filter((column) => !column.locked).map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={!hidden.includes(column.id)}
                onCheckedChange={(checked) =>
                  persist(
                    checked
                      ? hidden.filter((id) => id !== column.id)
                      : [...hidden, column.id],
                  )
                }
                onSelect={(event) => event.preventDefault()}
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={false}
              onSelect={(event) => {
                event.preventDefault()
                persist(COLUMNS.filter((c) => c.defaultHidden).map((c) => c.id))
              }}
            >
              Reset to default
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="overflow-hidden">
        {/* Scrolls on screen, prints whole (the print stylesheet drops the
            viewport clamp so every row lands on paper). */}
        <div className="max-h-[70vh] overflow-auto print:max-h-none print:overflow-visible">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_var(--color-border)]">
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                {visibleColumns.map((column) => {
                  const isSorted = column.sortBy && column.sortBy === sortBy
                  return (
                    <th
                      key={column.id}
                      scope="col"
                      className={cn(
                        'px-3 py-2 font-medium',
                        column.align === 'right' ? 'text-right' : 'text-left',
                      )}
                    >
                      {column.sortBy ? (
                        <button
                          type="button"
                          onClick={() => onSort(column.sortBy!)}
                          aria-sort={
                            isSorted
                              ? sortDir === 'asc'
                                ? 'ascending'
                                : 'descending'
                              : 'none'
                          }
                          className={cn(
                            'inline-flex items-center gap-1 hover:text-foreground',
                            isSorted && 'text-foreground',
                            column.align === 'right' && 'flex-row-reverse',
                          )}
                          title={`Sort by ${column.header}`}
                        >
                          {column.header}
                          {isSorted ? (
                            sortDir === 'asc' ? (
                              <IconSortAscending className="h-3.5 w-3.5" />
                            ) : (
                              <IconSortDescending className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <IconArrowsSort className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  )
                })}
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {batches.map((batch, index) => {
                const severity = batchSeverity(batch)
                return (
                  <tr
                    key={`${batch.itemId}-${batch.godownId}-${batch.batchNo}`}
                    ref={(el) => {
                      rowRefs.current[index] = el
                    }}
                    tabIndex={0}
                    onClick={() => onInspect(batch)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    className={cn(
                      'cursor-pointer border-b outline-none transition-colors last:border-0 hover:bg-muted/40 focus-visible:bg-muted/60',
                      severity === 'danger' && 'bg-destructive/[0.04]',
                      severity === 'warning' && 'bg-amber-500/[0.04]',
                    )}
                  >
                    {visibleColumns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          'max-w-[240px] truncate px-3 py-1.5',
                          column.align === 'right' && 'text-right',
                        )}
                      >
                        {column.render(batch)}
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Inspect this batch"
                        aria-label={`Inspect batch ${batch.batchNo}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          onInspect(batch)
                        }}
                      >
                        <IconSearch className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {batches.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <IconPackage className="h-4 w-4" />
          No batches on this page.
        </div>
      )}
    </div>
  )
}
