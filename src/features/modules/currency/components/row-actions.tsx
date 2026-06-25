import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useCurrency } from "../contexts/currency-context"
import type { Currency } from "../data/schema"

import { Route as CurrencyDetailRoute } from '@/routes/_protected/masters/organization/_layout/currency/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<Currency>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, currentRow, setCurrentRow } = useCurrency()
    const { row } = props
    return (
        <DataTableRowActions<Currency>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data)
                console.log("row Action: ", currentRow)
                navigate({
                    to: CurrencyDetailRoute.to,
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