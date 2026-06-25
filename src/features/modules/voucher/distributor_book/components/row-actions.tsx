import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"

import type { DistributorBookSchema } from "../data/schema"

import { Button } from "@/components/ui/button"

import { IconListDetails } from "@tabler/icons-react"



interface DataTableRowActionsProps {
    row: Row<DistributorBookSchema>
}

const RowActions = (props: DataTableRowActionsProps) => {
    // const { setOpen, setCurrentRow } = useDayBook()
    const navigate = useNavigate()
    const { row } = props
    return (
        <div
            className="flex items-center gap-2">

            <Button variant={'outline'} size={'sm'}
                onClick={() => {

                    navigate({
                        to: `/reports/distributor_book/${row.original.id}`,
                    });
                }}
            ><IconListDetails size={30} /> View book in details </Button>

            {/* <DataTableRowActions<DistributorBookSchema>
            row={row}
            onEdit={(data) => {
                // setCurrentRow(data)
                const voucherType = data?.name.toLowerCase().replaceAll(" ", "_")
                navigate({
                    to: `/transactions/vouchers/${voucherType}/${data.id}`,
                });
            }}
            onDelete={(data) => {
                setCurrentRow(data)
                setOpen("delete")
            }}
        /> */}
        </div>
    )
}

export default RowActions


