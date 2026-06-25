import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import type { Row } from "@tanstack/react-table"
import { useDesignation } from "../contexts/designation-context"
import type { Designation } from "../data/schema"


interface DataTableRowActionsProps {
    row: Row<Designation>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = useDesignation()
    const { row } = props
    return (
        <DataTableRowActions<Designation>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                setOpen("edit")
            }}
            onDelete={(data) => {
                setCurrentRow(data)
                setOpen("delete")
            }}
        />
    )
}

export default RowActions