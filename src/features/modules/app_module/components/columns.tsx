import LongText from '@/components/long-text'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

import Icon from '@/components/icon'

import { DataTableColumnHeader } from '@/features/global/components/data-table/data-table-column-header'
import { ActiveInactiveStatusTypes } from '@/types/active-inactive-status'
import type { AppModule } from '../data/schema'
import RowActions from './row-actions'

import { ActionDialog as ModuleFeatureActionDialog } from '../../app_module_feature/components/action-dialog'

import type { AppModuleFeature } from '../../app_module_feature/data/schema'
import React from 'react'

import { IconPlus } from '@tabler/icons-react'

export const columns: ColumnDef<AppModule>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
      ),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: 'icon',
    header: 'Icon',
    cell: ({ row }) => <Icon name={row.getValue('icon')} />,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <LongText className="max-w-36 flex items-center gap-2">
          {row.getValue('name')}
        </LongText>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-0 md:table-cell',
      ),
    },
    enableHiding: false,
  },

  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => (
      <div className="w-fit text-nowrap">{row.getValue('code')}</div>
    ),
  },

  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => <div>{row.getValue('description')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'features',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Features" />
    ),
    cell: ({ row }) => {
      const features = row.getValue('features') as
        AppModuleFeature[] | undefined
      return (
        <div className="flex flex-wrap gap-2">
          <AppModuleFeatureAddButton currentRow={row.original} />
          {features?.map(
            (feature: AppModuleFeature) =>
              feature && (
                <AppModuleFeatureButton key={feature.id} currentRow={feature} />
              ),
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor = ActiveInactiveStatusTypes.get(status)
      return (
        <div className="flex space-x-2">
          <Badge variant="outline" className={cn('capitalize', badgeColor)}>
            {row.getValue('status')}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },

  {
    id: 'actions',
    cell: RowActions,
  },
]

const AppModuleFeatureAddButton = ({
  currentRow,
}: {
  currentRow: AppModule
}) => {
  const [open, setOpen] = React.useState(false)
  const keyName = 'app-module-feature'
  return (
    <>
      <Badge
        variant="outline"
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <IconPlus className="mr-2 h-4 w-4" />
      </Badge>
      <ModuleFeatureActionDialog
        key={`${keyName}-add-${currentRow?.id}`}
        open={open}
        defaultModuleId={currentRow?.id}
        onOpenChange={() => {
          setOpen(!open)
        }}
      />
    </>
  )
}
const AppModuleFeatureButton = ({
  currentRow,
}: {
  currentRow: AppModuleFeature
}) => {
  const [open, setOpen] = React.useState(false)
  const keyName = 'app-module-feature'
  return (
    <>
      <Badge
        variant="outline"
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {currentRow.name}
      </Badge>
      <ModuleFeatureActionDialog
        key={`${keyName}-edit-${currentRow?.id}`}
        currentRow={currentRow}
        open={open}
        onOpenChange={() => {
          setOpen(!open)
        }}
      />
    </>
  )
}
