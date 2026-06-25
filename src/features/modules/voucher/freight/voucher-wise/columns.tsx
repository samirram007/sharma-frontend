import { VoucherTypeColorMapping } from "../data/data";
import { DataTableRowActions } from "../components/data-table-row-actions";
import type { FreightVoucherSchema } from "../data/schema";
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import LongText from "@/components/long-text";
import { DataTableColumnHeader } from "@/features/global/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";

import { toSentenceCase } from "@/utils/removeEmptyStrings";

export const columns: Array<ColumnDef<FreightVoucherSchema>> = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
                className='translate-y-0.5'
            />
        ),
        meta: {
            className: cn(
                'sticky md:table-cell left-0 z-10 rounded-tl',
                'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
            ),
        },
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
                className='translate-y-0.5'
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'voucherDate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Date' />
        ),
        cell: ({ row }) => {

            return (
                <LongText className='max-w-36 flex items-center gap-2'>
                    {formatDDMMMYYYY(row.getValue('voucherDate'))}
                </LongText>
            );
        },
        meta: {
            className: cn(
                'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
                '  transition-colors duration-200  ',
                'sticky left-0 md:table-cell',
            ),
        },
        enableHiding: false,
    },
    {
        accessorKey: 'partyName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Particulars' />
        ),
        filterFn: (row, columnId, filterValues: Array<string>) => {
            if (!filterValues || filterValues.length === 0) return true;
            const partyName = row.getValue(columnId) as string;
            return filterValues.includes(partyName);

        },
        cell: ({ row }) => {
            const { partyLedger, module } = row.original;
            const key = module.replace(/\s+/g, "_"); // "freight"
            const badgeColor = VoucherTypeColorMapping.get(key);
            if (!partyLedger) {
                return <div className="text-muted-foreground">Primary</div>;
            }
            return (
                <div className="flex space-x-2">
                    <Badge
                        variant="outline"
                        className={cn("capitalize", badgeColor, "bg-transparent")}
                    >
                        {partyLedger.name}
                    </Badge>
                </div>
            );
        },
        enableHiding: false,
    },
    {
        accessorKey: 'voucherType',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Vch. Type' />
        ),
        cell: ({ row }) => {
            const { module } = row.original
            const key = module.replace(/\s+/g, '_');
            const badgeColor = VoucherTypeColorMapping.get(key);
            if (!module) {
                return <div className='text-muted-foreground'>Primary</div>
            }
            return (
                <div className='flex space-x-2'>
                    <Badge variant='default' className={cn('capitalize', badgeColor)}>
                        {row.original.module ? row.original.module : (module ?? 'Unknown')}
                    </Badge>

                </div>
            )
        },
        enableHiding: false,
    },
    {
        accessorKey: 'voucherNo',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} className="text-center justify-center" title='VchNo.' />
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue('voucherNo')}</div>,
        enableSorting: true,
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Amount' className='text-right justify-end pr-4' />
        ),
        cell: ({ row }) => {
            const { paymentStatus } = row.original;

            const badgeColor = 'bg-purple-100 text-purple-900';
            return (
                <div className='flex flex-col items-end text-right space-x-2 justify-end pr-4'>
                    <Badge variant='outline' className={cn('capitalize', badgeColor, 'border-0 bg-transparent')}>
                        {Number(row.getValue('amount')).toFixed(2)}
                    </Badge>
                    <div className="pr-4 text-xs text-muted-foreground">
                        ({paymentStatus ? toSentenceCase(paymentStatus) : 'Unknown'})
                    </div>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        enableHiding: false,
        enableSorting: true,
    },
    {
        id: 'actions',
        cell: DataTableRowActions,
    },


]

const formatDDMMMYYYY = (value: string | Date) => {
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};