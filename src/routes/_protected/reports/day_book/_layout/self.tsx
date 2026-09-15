import DayBook from '@/features/modules/voucher/day_book'
import { dayBookSelfQueryOptions } from '@/features/modules/voucher/day_book/data/queryOptions'
import type { DayBookParams } from '@/features/modules/voucher/day_book/data/api'

import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import type { SortingState } from '@tanstack/react-table'

export const Route = createFileRoute(
  '/_protected/reports/day_book/_layout/self',
)({
  component: () => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useLocalStorage<number>(
      'daybook_per_page',
      10,
    )
    const [appliedSearch, setAppliedSearch] = useState('')
    const [voucherTypeIds, setVoucherTypeIds] = useState<string[]>([])
    const [billingPreferences, setBillingPreferences] = useState<string[]>([])
    const [statuses, setStatuses] = useState<string[]>([])
    const [sortBy, setSortBy] = useState('')
    const [sortOrder, setSortOrder] = useState('')

    const params: DayBookParams = {
      page,
      per_page: perPage,
      ...(appliedSearch ? { search: appliedSearch } : {}),
      ...(voucherTypeIds.length > 0
        ? { voucher_type_id: voucherTypeIds.join(',') }
        : {}),
      ...(billingPreferences.length > 0
        ? { billing_preference: billingPreferences.join(',') }
        : {}),
      ...(statuses.length > 0 ? { status: statuses.join(',') } : {}),
      ...(sortBy ? { sort_by: sortBy, sort_order: sortOrder } : {}),
    }

    const { data: daybook, isLoading } = useQuery(
      dayBookSelfQueryOptions(params),
    )

    const handlePageChange = useCallback((newPage: number) => {
      setPage(newPage)
    }, [])

    const handlePageSizeChange = useCallback(
      (newSize: number) => {
        setPerPage(newSize)
        setPage(1)
      },
      [setPerPage],
    )

    // Applied on Enter from the toolbar — no per-keystroke server queries.
    const handleSearchChange = useCallback((value: string) => {
      setAppliedSearch(value)
      setPage(1)
    }, [])

    const handleVoucherTypeChange = useCallback((value: string[]) => {
      setVoucherTypeIds(value)
      setPage(1)
    }, [])

    const handleBillingPreferenceChange = useCallback((value: string[]) => {
      setBillingPreferences(value)
      setPage(1)
    }, [])

    const handleStatusChange = useCallback((value: string[]) => {
      setStatuses(value)
      setPage(1)
    }, [])

    const handleSortChange = useCallback(
      (newSortBy: string, newSortOrder: string) => {
        setSortBy(newSortBy)
        setSortOrder(newSortOrder)
        setPage(1)
      },
      [],
    )

    // Convert to TanStack SortingState for the table (reverse map backend field → column id)
    const sortFieldReverseMap: Record<string, string> = {
      billing_preference: 'billingPreference',
    }
    const sorting: SortingState = sortBy
      ? [
          {
            id: sortFieldReverseMap[sortBy] ?? sortBy,
            desc: sortOrder === 'desc',
          },
        ]
      : []

    if (isLoading && !daybook) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin h-8 w-8" />
        </div>
      )
    }

    return (
      <DayBook
        data={daybook?.data ?? []}
        paginationMeta={daybook?.meta}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        onVoucherTypeChange={handleVoucherTypeChange}
        selectedVoucherTypes={voucherTypeIds}
        onBillingPreferenceChange={handleBillingPreferenceChange}
        selectedBillingPreferences={billingPreferences}
        onStatusChange={handleStatusChange}
        selectedStatuses={statuses}
        onSortChange={handleSortChange}
        sorting={sorting}
      />
    )
  },
  errorComponent: () => <div>Error loading day Book data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})
