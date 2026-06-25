import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import type { Row } from "@tanstack/react-table"

import type { DeliveryVehicle } from "../data/schema"
import { useDeliveryVehicle } from "../contexts/delivery_vehicle-context"


interface DataTableRowActionsProps {
    row: Row<DeliveryVehicle>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const { setOpen, setCurrentRow } = useDeliveryVehicle()
    const { row } = props
    return (
        <DataTableRowActions<DeliveryVehicle>
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