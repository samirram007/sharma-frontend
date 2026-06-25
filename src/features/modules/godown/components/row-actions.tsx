import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import type { Row } from "@tanstack/react-table"
import { useGodown } from "../contexts/godown-context"
import type { Godown } from "../data/schema"


interface DataTableRowActionsProps {
    row: Row<Godown>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = useGodown()
    const { row } = props
    return (
        <DataTableRowActions<Godown>
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