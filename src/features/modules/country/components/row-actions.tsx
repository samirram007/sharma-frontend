import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useCountry } from "../contexts/country-context"
import type { Country } from "../data/schema"

import { Route as CountryDetailRoute } from '@/routes/_protected/masters/organization/_layout/country/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<Country>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, currentRow, setCurrentRow } = useCountry()
    const { row } = props
    return (
        <DataTableRowActions<Country>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                console.log("row Action: ", currentRow)
                navigate({
                    to: CountryDetailRoute.to,
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