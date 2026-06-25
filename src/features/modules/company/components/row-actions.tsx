import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useCompany } from "../contexts/company-context"
import type { Company } from "../data/schema"

import { Route as CompanyDetailRoute } from '@/routes/_protected/masters/organization/_layout/company/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<Company>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, currentRow, setCurrentRow } = useCompany()
    const { row } = props
    return (
        <DataTableRowActions<Company>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                console.log("row Action: ", currentRow)
                navigate({
                    to: CompanyDetailRoute.to,
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