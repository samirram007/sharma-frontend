import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useFiscalYear } from "../contexts/fiscal_year-context"
import type { FiscalYear } from "../data/schema"

import { Route as FiscalYearDetailRoute } from '@/routes/_protected/masters/organization/_layout/fiscal_year/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<FiscalYear>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, currentRow, setCurrentRow } = useFiscalYear()
    const { row } = props
    return (
        <DataTableRowActions<FiscalYear>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                console.log("row Action: ", currentRow)
                navigate({
                    to: FiscalYearDetailRoute.to,
                    params: { id: data.id! },
                })

            }}
            onDelete={(data) => {
                setCurrentRow(data)
                setOpen("delete")
            }}
        />
    )
}

export default RowActions