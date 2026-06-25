import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useDistributor } from "../contexts/distributor-context"
import type { Distributor } from "../data/schema"

import { Route as DistributorDetailRoute } from '@/routes/_protected/masters/party/_layout/distributor/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<Distributor>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, currentRow, setCurrentRow } = useDistributor()
    const { row } = props
    return (
        <DataTableRowActions<Distributor>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                console.log("row Action: ", currentRow)
                navigate({
                    to: DistributorDetailRoute.to,
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