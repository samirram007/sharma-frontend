import { Main } from '@/layouts/components/main'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

import { columns } from './components/columns'

import { Dialogs } from './components/dialogs'
import { GridTable } from './components/grid-table'
import { PrimaryButtons } from './components/primary-buttons'
import StockGroupProvider from './contexts/stock_group-context'
import { stockGroupListSchema, type StockGroupList } from './data/schema'

export type StockGroupListStatus = 'active' | 'inactive' | 'all'

interface StockGroupProps {
  data: StockGroupList
  /** Which status slice is currently loaded (server-filtered). */
  status?: StockGroupListStatus
  /** Request a different status slice from the server. */
  onStatusChange?: (status: StockGroupListStatus) => void
  /** True while a status slice is being fetched from the server. */
  refreshing?: boolean
}

const STATUS_OPTIONS: { value: StockGroupListStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'all', label: 'All' },
]

function StatusFilter({
  value,
  onChange,
  refreshing,
}: {
  value: StockGroupListStatus
  onChange: (status: StockGroupListStatus) => void
  refreshing?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {refreshing && (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Loading" />
        )}
        Status
      </span>
      <div className="inline-flex rounded-lg border border-slate-200/80 bg-background p-0.5 shadow-sm dark:border-white/10">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'h-7 rounded-md px-3 text-xs font-medium transition-colors',
              value === option.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function StockGroup({
  data,
  status,
  onStatusChange,
  refreshing,
}: StockGroupProps) {
  return (
    <StockGroupProvider>
      <Main className="min-w-full">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Stock Group List
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your stock categories here.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {status && onStatusChange && (
              <StatusFilter
                value={status}
                onChange={onStatusChange}
                refreshing={refreshing}
              />
            )}
            <PrimaryButtons />
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <GridTable
            data={stockGroupListSchema.parse(data ?? [])}
            columns={columns}
          />
        </div>
      </Main>

      <Dialogs />
    </StockGroupProvider>
  )
}
