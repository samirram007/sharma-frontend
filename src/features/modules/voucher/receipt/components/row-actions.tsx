import { useNavigate } from "@tanstack/react-router"
import type { Row } from "@tanstack/react-table"

import type { ReceiptSchema } from "../data/schema"
import PrintDialog from "./print-dialog"
import { Button } from "@/components/ui/button"

import { IconEdit } from "@tabler/icons-react"
import { SkeletonButton } from "@/components/skeleton"


interface DataTableRowActionsProps {
    row: Row<ReceiptSchema>
}

const RowActions = (props: DataTableRowActionsProps) => {
    // const { setOpen, setCurrentRow } = useReceipt()
    const navigate = useNavigate()
    const { row } = props
    return (
        <div
            className="flex items-center gap-2">

            {row?.original?.voucherType?.id === 1006 ? <PrintDialog data={row?.original} /> : <SkeletonButton />}
            {
                [2001, 2002].includes(row?.original?.voucherType?.id) ?

                    <Button variant={'link'}
                        onClick={() => {
                            const voucherType = row?.original?.voucherType?.name.toLowerCase().replaceAll(" ", "_")
                            navigate({
                                to: `/transactions/vouchers/${voucherType}/${row.original.id}`,
                            });
                        }}
                    ><IconEdit size={30} /> </Button>
                    : <SkeletonButton />
            }
            {/* <DataTableRowActions<ReceiptSchema>
            row={row}
            onEdit={(data) => {
                // setCurrentRow(data)
                const voucherType = data?.voucherType?.name.toLowerCase().replaceAll(" ", "_")
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


