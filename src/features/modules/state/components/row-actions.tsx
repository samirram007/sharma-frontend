import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useStateRegion } from "../contexts/state-context"
import type { State } from "../data/schema"

import { Route as StateDetailRoute } from '@/routes/_protected/masters/organization/_layout/state/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<State>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, currentRow, setCurrentRow } = useStateRegion()
    const { row } = props
    return (
        <DataTableRowActions<State>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                console.log("row Action: ", currentRow)
                navigate({
                    to: StateDetailRoute.to,
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