import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useTransporter } from "../contexts/transporter-context"
import type { Transporter } from "../data/schema"

import { Route as TransporterDetailRoute } from '@/routes/_protected/masters/party/_layout/transporter/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<Transporter>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, currentRow, setCurrentRow } = useTransporter()
    const { row } = props
    return (
        <DataTableRowActions<Transporter>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                console.log("row Action: ", currentRow)
                navigate({
                    to: TransporterDetailRoute.to,
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