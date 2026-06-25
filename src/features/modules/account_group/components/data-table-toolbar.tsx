import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Cross2Icon } from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'


import { capitalizeAllWords } from '@/utils/removeEmptyStrings'
import { useQuery } from '@tanstack/react-query'
import type { AccountNature } from '../../account_nature/data/schema'

import { fetchAccountNatureService } from '../../account_nature/data/api'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter account group...'
          value={
            (table.getColumn('name')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Status'
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
            />
          )}

          <AccountNatureDropdown table={table} />

        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}


function AccountNatureDropdown<TData>({ table }: DataTableToolbarProps<TData>) {
  const { data: accountNatureList, isLoading } = useQuery({
    queryKey: ["accountNatures"],
    queryFn: fetchAccountNatureService,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      {table.getColumn('accountNatureId') && (
        <DataTableFacetedFilter
          column={table.getColumn('accountNatureId')}
          title='Accounting Nature'
          options={accountNatureList?.data.map((accountNature: AccountNature) => ({
            label: capitalizeAllWords(accountNature.name),
            value: accountNature.id,
          }))} />)
      }
    </>
  )

};