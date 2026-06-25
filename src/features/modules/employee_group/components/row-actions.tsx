import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import type { Row } from "@tanstack/react-table"
import { useEmployeeGroup } from "../contexts/employee_group-context"
import type { EmployeeGroup } from "../data/schema"


interface DataTableRowActionsProps {
    row: Row<EmployeeGroup>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = useEmployeeGroup()
    const { row } = props
    return (
        <DataTableRowActions<EmployeeGroup>
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