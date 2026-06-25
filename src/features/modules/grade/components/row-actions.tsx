import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import type { Row } from "@tanstack/react-table"
import { useGrade } from "../contexts/grade-context"
import type { Grade } from "../data/schema"


interface DataTableRowActionsProps {
    row: Row<Grade>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = useGrade()
    const { row } = props
    return (
        <DataTableRowActions<Grade>
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