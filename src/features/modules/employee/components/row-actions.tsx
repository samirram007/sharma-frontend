import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useEmployee } from "../contexts/employee-context"
import type { Employee } from "../data/schema"

import { Route as EmployeeDetailRoute } from '@/routes/_protected/masters/payroll/_layout/employee/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<Employee>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, currentRow, setCurrentRow } = useEmployee()
    const { row } = props
    return (
        <DataTableRowActions<Employee>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                console.log("row Action: ", currentRow)
                navigate({
                    to: EmployeeDetailRoute.to,
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