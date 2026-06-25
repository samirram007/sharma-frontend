import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useSupplier } from "../contexts/supplier-context"
import type { Supplier } from "../data/schema"

import { Route as SupplierDetailRoute } from '@/routes/_protected/masters/party/_layout/supplier/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<Supplier>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, currentRow, setCurrentRow } = useSupplier()
    const { row } = props
    return (
        <DataTableRowActions<Supplier>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                console.log("row Action: ", currentRow)
                navigate({
                    to: SupplierDetailRoute.to,
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