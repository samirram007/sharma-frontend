import type { Row } from "@tanstack/react-table"
import { usePermission } from "../contexts/permission-context"
import type { Permission } from "../data/schema"
import { DataTableRowActions } from "./data-table-row-actions"


interface DataTableRowActionsProps {
    row: Row<Permission>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = usePermission()
    const { row } = props
    return (
        <DataTableRowActions<Permission>
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