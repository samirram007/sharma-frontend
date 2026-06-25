import { DataTableRowActions } from "@/features/global/components/data-table/data-table-row-actions"
import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"
import { useStockItem } from "../contexts/stock_item-context"
import type { StockItem } from "../data/schema"

import { Route as StockItemDetailRoute } from '@/routes/_protected/masters/inventory/_layout/stock_item/_layout/$id'

interface DataTableRowActionsProps {
    row: Row<StockItem>
}

const RowActions = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { setOpen, setCurrentRow } = useStockItem()
    const { row } = props
    return (
        <DataTableRowActions<StockItem>
            row={row}
            onEdit={(data) => {
                setCurrentRow(data) 
                navigate({
                    to: StockItemDetailRoute.to,
                    params: { id: data.id! },
                })

            }}
            // onConfigure={(data) => {
            //     setCurrentRow(data)
            //     navigate({
            //         to: StockItemConfigureRoute.to,
            //         params: { id: data.id! },
            //     })

            // }}
            onDelete={(data) => {
                setCurrentRow(data)
                setOpen("delete")
            }}
        />
    )
}

export default RowActions