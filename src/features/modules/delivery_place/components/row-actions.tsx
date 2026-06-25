import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import type { Row } from "@tanstack/react-table"
import { useDeliveryPlace } from "../contexts/delivery_place-context"
import type { DeliveryPlace } from "../data/schema"


interface DataTableRowActionsProps {
    row: Row<DeliveryPlace>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = useDeliveryPlace()
    const { row } = props
    return (
        <DataTableRowActions<DeliveryPlace>
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