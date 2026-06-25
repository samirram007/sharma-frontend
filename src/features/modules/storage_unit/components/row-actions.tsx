import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useStorageUnit } from "../contexts/storage_unit-context"
import type { StorageUnit } from "../data/schema"

import { Route as StorageUnitDetailRoute } from '@/routes/_protected/masters/inventory/_layout/storage_unit/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<StorageUnit>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, currentRow, setCurrentRow } = useStorageUnit()
    const { row } = props
    return (
        <DataTableRowActions<StorageUnit>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                console.log("row Action: ", currentRow)
                navigate({
                    to: StorageUnitDetailRoute.to,
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