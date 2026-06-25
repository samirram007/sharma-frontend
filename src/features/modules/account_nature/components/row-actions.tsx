import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import type { Row } from "@tanstack/react-table"
import { useAccountNature } from "../contexts/account_nature-context"
import type { AccountNature } from "../data/schema"


interface DataTableRowActionsProps {
    row: Row<AccountNature>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = useAccountNature()
    const { row } = props
    return (
        <DataTableRowActions<AccountNature>
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