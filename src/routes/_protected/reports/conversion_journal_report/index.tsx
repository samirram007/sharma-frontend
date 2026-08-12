import ConversionJournalReport from '@/features/modules/voucher/conversion_journal_report'
import { conversionJournalReportQueryOptions } from '@/features/modules/voucher/conversion_journal_report/data/queryOptions'
import type { ConversionJournalReportParams } from '@/features/modules/voucher/conversion_journal_report/data/api'

import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader, AlertTriangle, RefreshCw } from 'lucide-react'
import { useState, useCallback, useRef } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import type { SortingState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { AxiosError } from 'axios'

export const Route = createFileRoute(
  '/_protected/reports/conversion_journal_report/',
)({
  component: () => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useLocalStorage<number>(
      'conversion_journal_report_per_page',
      10,
    )
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [sortBy, setSortBy] = useState('')
    const [sortOrder, setSortOrder] = useState('')
    const [stockJournalType, setStockJournalType] = useState('')
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const params: ConversionJournalReportParams = {
      page,
      per_page: perPage,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(sortBy ? { sort_by: sortBy, sort_order: sortOrder } : {}),
      ...(stockJournalType ? { stock_journal_type: stockJournalType } : {}),
    }

    const {
      data: reportData,
      isLoading,
      error,
      refetch,
    } = useQuery(conversionJournalReportQueryOptions(params))

    const handlePageChange = useCallback(
      (newPage: number) => setPage(newPage),
      [],
    )
    const handlePageSizeChange = useCallback(
      (newSize: number) => {
        setPerPage(newSize)
        setPage(1)
      },
      [setPerPage],
    )

    const handleSearchChange = useCallback((value: string) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = setTimeout(() => {
        setDebouncedSearch(value)
        setPage(1)
      }, 400)
    }, [])

    const handleSortChange = useCallback(
      (newSortBy: string, newSortOrder: string) => {
        setSortBy(newSortBy)
        setSortOrder(newSortOrder)
        setPage(1)
      },
      [],
    )

    const handleStockJournalTypeChange = useCallback((value: string) => {
      setStockJournalType(value)
      setPage(1)
    }, [])

    // Convert to TanStack SortingState for the table (reverse map backend field to column id)
    const sortFieldReverseMap: Record<string, string> = {
      voucher_date: 'voucherDate',
      voucher_no: 'voucherNo',
      amount: 'amount',
    }
    const sorting: SortingState = sortBy
      ? [
          {
            id: sortFieldReverseMap[sortBy] ?? sortBy,
            desc: sortOrder === 'desc',
          },
        ]
      : []

    // Show query error inline (even when stale data exists, so a failed
    // refetch never goes silent now that the global error toast is suppressed)
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-lg font-semibold">
              Error loading conversion journal report
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg text-center">
            {error instanceof AxiosError
              ? `API Error (${error.response?.status ?? 'Network'}): ${error.response?.data?.message ?? error.message}`
              : (error as Error)?.message || 'An unexpected error occurred.'}
          </p>
          {error instanceof AxiosError && error.response?.data?.errors && (
            <ul className="text-xs text-muted-foreground max-w-md space-y-1">
              {Object.entries(error.response.data.errors).map(
                ([field, msgs]) => (
                  <li key={field} className="text-left">
                    <span className="font-medium">{field}:</span>{' '}
                    {(msgs as string[]).join(', ')}
                  </li>
                ),
              )}
            </ul>
          )}
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )
    }

    if (isLoading && !reportData) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin h-8 w-8" />
        </div>
      )
    }

    return (
      <ConversionJournalReport
        data={reportData?.data ?? []}
        paginationMeta={reportData?.meta}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        sorting={sorting}
        stockJournalType={stockJournalType}
        onStockJournalTypeChange={handleStockJournalTypeChange}
      />
    )
  },
  errorComponent: ({ error }) => {
    const message =
      error instanceof Error ? error.message : String(error ?? 'Unknown error')
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-lg font-semibold">Unexpected render error</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-lg text-center font-mono">
          {message}
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reload page
        </Button>
      </div>
    )
  },
  pendingComponent: () => <Loader className="animate-spin" />,
})
