import { DataTableRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import { useNavigate } from '@tanstack/react-router'
import type { Row } from '@tanstack/react-table'
import { useFiscalYear } from '../contexts/fiscal_year-context'
import type { FiscalYear } from '../data/schema'
import { Button } from '@/components/ui/button'
import { IconArchive, IconDoorEnter } from '@tabler/icons-react'

import { Route as FiscalYearDetailRoute } from '@/routes/_protected/masters/organization/_layout/fiscal_year/_layout/$id'

interface DataTableRowActionsProps {
  row: Row<FiscalYear>
}

const RowActions = (props: DataTableRowActionsProps) => {
  const navigate = useNavigate()
  const { setOpen, currentRow, setCurrentRow } = useFiscalYear()
  const { row } = props
  const fyId = row.original.id
  const isClosed = !!row.original.closedAt
  return (
    <div className="flex items-center gap-1">
      {!isClosed && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Close Fiscal Year"
          onClick={() =>
            navigate({
              to: '/masters/organization/fiscal_year/$id/close',
              params: { id: fyId! },
            })
          }
        >
          <IconArchive className="h-4 w-4 text-amber-600" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Opening Journal"
        onClick={() =>
          navigate({
            to: '/masters/organization/fiscal_year/$id/open',
            params: { id: fyId! },
          })
        }
      >
        <IconDoorEnter className="h-4 w-4 text-blue-600" />
      </Button>
      <DataTableRowActions<FiscalYear>
        row={row}
        onEdit={(data) => {
          setCurrentRow(data)
          console.log('row Action: ', currentRow)
          navigate({
            to: FiscalYearDetailRoute.to,
            params: { id: data.id! },
          })
        }}
        onDelete={(data) => {
          setCurrentRow(data)
          setOpen('delete')
        }}
      />
    </div>
  )
}

export default RowActions
