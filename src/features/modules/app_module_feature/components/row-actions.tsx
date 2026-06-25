import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import type { Row } from "@tanstack/react-table"
import { useAppModuleFeature } from "../contexts/app_module_feature-context"
import type { AppModuleFeature } from "../data/schema"


interface DataTableRowActionsProps {
    row: Row<AppModuleFeature>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = useAppModuleFeature()
    const { row } = props
    return (
        <DataTableRowActions<AppModuleFeature>
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