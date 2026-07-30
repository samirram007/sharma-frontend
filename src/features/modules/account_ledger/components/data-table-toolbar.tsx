import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { useMemo } from 'react'

import { fetchAccountGroupService } from '@/features/masters/accounts/services/apis'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

interface AccountGroupNode {
  id: number
  name: string
  parentId: number | null
  natureName: string
  children: AccountGroupNode[]
}

/** Build a tree from flat account group list using parentId */
function buildGroupTree(groups: AccountGroupNode[]): AccountGroupNode[] {
  const map = new Map<number, AccountGroupNode>()
  const roots: AccountGroupNode[] = []

  for (const g of groups) {
    map.set(g.id, { ...g, children: [] })
  }

  for (const g of groups) {
    const node = map.get(g.id)!
    if (g.parentId && map.has(g.parentId)) {
      map.get(g.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

/** Flatten a tree into an array with depth levels for CSS-indented rendering */
function flattenTree(
  nodes: AccountGroupNode[],
  depth: number = 0,
  result: { value: string; label: string; depth: number }[] = []
) {
  for (const node of nodes) {
    result.push({
      value: String(node.id),
      label: `${node.natureName ? node.natureName + ': ' : ''}${node.name}`,
      depth,
    })
    if (node.children.length > 0) {
      flattenTree(node.children, depth + 1, result)
    }
  }
  return result
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  // Fetch all account groups to build hierarchy
  const { data: accountGroupsData } = useQuery({
    queryKey: ['accountGroups'],
    queryFn: fetchAccountGroupService,
    staleTime: 1000 * 60 * 5,
  })

  const accountGroupOptions = useMemo(() => {
     
    const rawGroups: any[] = accountGroupsData?.data ?? []
    if (rawGroups.length === 0) return []

    const nodes: AccountGroupNode[] = rawGroups.map((g: any) => ({
      id: g.id,
      name: g.name,
      parentId: g.parentId ?? null,
      natureName: g.accountNature?.name ?? '',
      children: [],
    }))

    const tree = buildGroupTree(nodes)
    return flattenTree(tree)
  }, [accountGroupsData])

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter account ledger...'
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
          {table.getColumn('accountGroupId') && (
            <DataTableFacetedFilter
              column={table.getColumn('accountGroupId')}
              title='Account Group'
              options={accountGroupOptions}
              popoverWidth='w-[320px]'
            />
          )}
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


