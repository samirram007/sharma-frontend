import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useUser } from "../contexts/user-context"
import type { User } from "../data/schema"

import { Route as UserDetailRoute } from '@/routes/_protected/administration/_layout/user/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<User>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, currentRow, setCurrentRow } = useUser()
    const { row } = props
    return (
        <DataTableRowActions<User>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                console.log("row Action: ", currentRow)
                navigate({
                    to: UserDetailRoute.to,
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