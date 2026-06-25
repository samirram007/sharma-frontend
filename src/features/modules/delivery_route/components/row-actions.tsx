import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import type { Row } from "@tanstack/react-table"
import { useDeliveryRoute } from "../contexts/delivery_route-context"
import type { DeliveryRoute } from "../data/schema"


interface DataTableRowActionsProps {
    row: Row<DeliveryRoute>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = useDeliveryRoute()
    const { row } = props
    return (
        <DataTableRowActions<DeliveryRoute>
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