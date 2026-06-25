
import type { Row } from "@tanstack/react-table"
import { useRole } from "../contexts/role-context"
import type { Role } from "../data/schema"
import { DataTableRowActions } from "./data-table-row-actions"


interface DataTableRowActionsProps {
    row: Row<Role>
}

const RowActions = (props: DataTableRowActionsProps) => {

    const { setOpen, setCurrentRow } = useRole()
    const { row } = props
    return (
        <DataTableRowActions<Role>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                setOpen("edit")
            }}
            onDelete={(data) => {
                setCurrentRow(data)
                setOpen("delete")
            }}
            onPermissions={(data) => {
                setCurrentRow(data)
            // navigate({
            //     to: RolePermissionRoute.to,
            //     params: { id: data.id! },
            // })

            }}
        />
    )
}

export default RowActions