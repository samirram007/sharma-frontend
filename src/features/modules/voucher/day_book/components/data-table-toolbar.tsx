import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { DataTableViewOptions } from '@/features/tasks/components/data-table-view-options'
import { fetchUsedVoucherTypesService } from '../data/api'
import { date_format } from '@/utils/removeEmptyStrings'
import { Cross2Icon, CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'
import { useMemo, useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  placeHolder: string
  filteredRows: TData[]
  exportColumnsData: ExportColumn<TData>[]
  onSearchChange?: (value: string) => void
  onVoucherTypeChange?: (value: string[]) => void
  selectedVoucherTypes?: string[]
}
export interface ExportColumn<T> {
  header: string
  accessor: keyof T
}

interface VoucherTypeOption {
  id: number
  name: string
}

export function DataTableToolbar<TData>({
  table,
  placeHolder,
  filteredRows,
  exportColumnsData,
  onSearchChange,
  onVoucherTypeChange,
  selectedVoucherTypes = [],
}: DataTableToolbarProps<TData>) {
  const [voucherTypes, setVoucherTypes] = useState<VoucherTypeOption[]>([])
  const [searchValue, setSearchValue] = useState('')
  const autoSelectedRef = useRef(false)

  useEffect(() => {
    fetchUsedVoucherTypesService().then((res) => {
      if (res?.data) {
        setVoucherTypes(res.data)
        // Auto-select default voucher types on first load
        if (!autoSelectedRef.current && selectedVoucherTypes.length === 0) {
          const defaultNames = ['Delivery Note', 'Receipt Note', 'Sales', 'Receipt']
          const defaultIds = res.data
            .filter((vt: VoucherTypeOption) => defaultNames.includes(vt.name))
            .map((vt: VoucherTypeOption) => String(vt.id))
          if (defaultIds.length > 0) {
            onVoucherTypeChange?.(defaultIds)
          }
          autoSelectedRef.current = true
        }
      }
    }).catch(() => {})
  }, [onVoucherTypeChange])

  const exportData = useMemo(() => {
    return (filteredRows as any[]).map((row) => ({
      voucherDate: date_format(row.voucherDate) ?? '',
      partyLedger: row.partyLedger?.name ?? '',
      voucherType: row.voucherType?.name ?? '',
      voucherNo: row.voucherNo ?? '',
      amount: row.amount ?? '',
    }))
  }, [filteredRows])

  const filteredColumn = exportColumnsData.filter((col) => {
    return col.header !== 'actions' && col.header !== 'select'
  })

  const isFiltered = selectedVoucherTypes.length > 0 || searchValue

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearchChange?.(value)
  }

  const handleVoucherTypeToggle = (value: string) => {
    const current = new Set(selectedVoucherTypes)
    if (current.has(value)) {
      current.delete(value)
    } else {
      current.add(value)
    }
    onVoucherTypeChange?.(Array.from(current))
  }

  const handleReset = () => {
    setSearchValue('')
    table.resetColumnFilters()
    table.resetGlobalFilter()
    onSearchChange?.('')
    onVoucherTypeChange?.([])
  }

  const voucherTypeOptions = voucherTypes.map((vt) => ({
    label: vt.name,
    value: String(vt.id),
  }))

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={placeHolder ?? 'Filter records...'}
          value={searchValue}
          onChange={handleSearchChange}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' size='sm' className='h-8 border-dashed'>
              <PlusCircledIcon className='mr-1 h-4 w-4' />
              Voucher Type
              {selectedVoucherTypes.length > 0 && (
                <>
                  <Separator orientation='vertical' className='mx-2 h-4' />
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal lg:hidden'
                  >
                    {selectedVoucherTypes.length}
                  </Badge>
                  <div className='hidden space-x-1 lg:flex'>
                    {selectedVoucherTypes.length > 2 ? (
                      <Badge
                        variant='secondary'
                        className='rounded-sm px-1 font-normal'
                      >
                        {selectedVoucherTypes.length} selected
                      </Badge>
                    ) : (
                      voucherTypeOptions
                        .filter((option) => selectedVoucherTypes.includes(option.value))
                        .map((option) => (
                          <Badge
                            variant='secondary'
                            key={option.value}
                            className='rounded-sm px-1 font-normal'
                          >
                            {option.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[200px] p-0' align='start'>
            <Command>
              <CommandInput placeholder='Voucher Type' />
              <CommandList className='max-h-full'>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {voucherTypeOptions.map((option) => {
                    const isSelected = selectedVoucherTypes.includes(option.value)
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => handleVoucherTypeToggle(option.value)}
                      >
                        <div
                          className={cn(
                            'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <CheckIcon className={cn('h-4 w-4')} />
                        </div>
                        <span className='text-nowrap'>{option.label}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
                {selectedVoucherTypes.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => onVoucherTypeChange?.([])}
                        className='justify-center text-center'
                      >
                        Clear filters
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        variant="link"
        className="h-8 px-2 lg:px-3"
        onClick={async () => {
          const { default: exportTableToPdf } = await import('@/utils/export-table-pdf')
          exportTableToPdf({
            title: 'Day Book',
            columnData: filteredColumn as any,
            data: exportData,
            fileName: 'day-book-table.pdf',
          })
        }}
      >
        Export PDF
      </Button>
      <Button
        variant="link"
        className="h-8 px-2 lg:px-3"
        onClick={async () => {
          const { default: exportTableToExcel } = await import('@/utils/export-table-excel')
          exportTableToExcel({
            title: 'Day Book',
            columnData: filteredColumn as any,
            data: exportData,
            fileName: 'day-book-table.xlsx',
          })
        }}
      >
        Export EXCEL
      </Button>
      <DataTableViewOptions table={table} />
    </div>
  )
}