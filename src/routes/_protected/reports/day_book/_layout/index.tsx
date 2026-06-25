import DayBook from '@/features/modules/voucher/day_book';
import { dayBookQueryOptions } from '@/features/modules/voucher/day_book/data/queryOptions';
import type { DayBookParams } from '@/features/modules/voucher/day_book/data/api';

import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';

export const Route = createFileRoute(
  '/_protected/reports/day_book/_layout/',
)({
  component: () => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(() => {
      const saved = localStorage.getItem('daybook_per_page')
      return saved ? Number(saved) : 10
    })
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [voucherTypeIds, setVoucherTypeIds] = useState<string[]>([])
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const params: DayBookParams = {
      page,
      per_page: perPage,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(voucherTypeIds.length > 0 ? { voucher_type_id: voucherTypeIds.join(',') } : {}),
    }

    const { data: daybook, isLoading } = useQuery(dayBookQueryOptions(params))

    const handlePageChange = useCallback((newPage: number) => {
      setPage(newPage)
    }, [])

    const handlePageSizeChange = useCallback((newSize: number) => {
      setPerPage(newSize)
      localStorage.setItem('daybook_per_page', String(newSize))
      setPage(1)
    }, [])

    const handleSearchChange = useCallback((value: string) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = setTimeout(() => {
        setDebouncedSearch(value)
        setPage(1)
      }, 400)
    }, [])

    const handleVoucherTypeChange = useCallback((value: string[]) => {
      setVoucherTypeIds(value)
      setPage(1)
    }, [])

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
      />
    )
  },
  errorComponent: () => <div>Error loading day Book data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})