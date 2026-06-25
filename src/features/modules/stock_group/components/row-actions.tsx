import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import type { Row } from "@tanstack/react-table"
import { useStockGroup } from "../contexts/stock_group-context"
import type { StockGroup } from "../data/schema"


interface DataTableRowActionsProps {
    row: Row<StockGroup>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = useStockGroup()
    const { row } = props
    return (
        <DataTableRowActions<StockGroup>
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