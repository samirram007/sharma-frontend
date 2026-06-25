import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import type { Row } from "@tanstack/react-table"
import { useAppModule } from "../contexts/app_module-context"
import type { AppModule } from "../data/schema"


interface DataTableRowActionsProps {
    row: Row<AppModule>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = useAppModule()
    const { row } = props
    return (
        <DataTableRowActions<AppModule>
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