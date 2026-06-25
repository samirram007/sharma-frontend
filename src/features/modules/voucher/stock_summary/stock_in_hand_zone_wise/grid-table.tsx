

// import { DataTablePagination } from '@/features/global/components/data-table/data-table-pagination'
import {

  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import type { StockInHandGodownWiseSchema, StockInHandZoneWiseSchema } from '../data/schema'
import { DataTableToolbar } from './data-table-toolbar'
import { Link } from '@tanstack/react-router'




declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface DataTableProps {
  columns: ColumnDef<StockInHandZoneWiseSchema>[]
  data: StockInHandZoneWiseSchema[]
  pagination?: boolean
}

export function GridTable({ columns, data }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ select: false })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    filterFns: {
      // Custom filter functions can be added here if needed
      fuzzy: (row, columnId, value) => {
        const columnValue = row.getValue(columnId)
        return columnValue && typeof columnValue === 'string'
          ? columnValue.toLowerCase().includes(value.toLowerCase())
          : false
      },
    },
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const keyName = 'Stock In Hand Zone Wise'
  return (
    <div className='space-y-1'>
      <DataTableToolbar table={table}
        placeHolder={`Filter ${keyName} `}
        filteredRows={data} />
      <div className='rounded-md border'>
        <ReportHeader />
        <ReportView table={table} />
        <ReportFooter table={table} />

      </div>


      {/* <DataTablePagination table={table} /> */}
    </div>
  )
}
const ReportHeader = () => {
  return (
    <div className=' grid grid-cols-[1fr_2fr] border-amber-950! bg-gray-100  text-center font-bold  '>
      <div className='text-accent-foreground border-2 text-left pl-2 font-stretch-ultra-expanded  h-full flex items-center'>PARTICULARS</div>
      <div className='grid grid-cols-4 border-2 border-l-0'>
        <div className=''>
          <div className='text-accent-foreground  border-b-2'>Opening</div>
          <div className='grid grid-cols-2'>
            <div>Qty</div>
            <div className='border-l-2'>Val</div>
          </div>
        </div>
        <div>
          <div className='text-accent-foreground border-b-2 border-l-2   ' >Inward</div>
          <div className='grid grid-cols-2'>
            <div className='border-l-2'>Qty</div>
            <div className='border-l-2'>Val</div>
          </div>
        </div>

        <div>
          <div className='text-accent-foreground border-b-2 border-l-2'>Outward</div>
          <div className='grid grid-cols-2'>
            <div className='border-l-2'>Qty</div>
            <div className='border-l-2'>Val</div>
          </div>
        </div>
        <div>
          <div className='text-accent-foreground border-b-2 border-l-2'>Closing</div>
          <div className='grid grid-cols-2'>
            <div className='border-l-2'>Qty</div>
            <div className='border-l-2'>Val</div>
          </div>
        </div>



      </div>
    </div>
  )
}


const ReportView = ({ table }: { table: any }) => {

  // console.log("TData", table.getRowModel().rows.map((row: any) => row.original));

  return <div className='w-full min-h-full  grid grid-rows-[auto_1fr]'>

    <div className='border-2 min-h-full'>

      {table.getRowModel().rows.map((zone: any, index: number) => (
        <div key={index} className='grid grid-rows-1 gap-0'>
          <div className={cn
            ('grid grid-cols-[1fr_2fr] text-center bg-gray-300 shadow-md  font-semibold'
            )
          }>
            <div className=' text-left pl-2'><Link to={'/reports/stock_summary/stock-in-hand-godown-wise'} className='inline-block mr-2   hover:text-blue-700'
            >
              {zone.original.zoneName ? `Zone: ${zone.original.zoneName}` : 'Zone: -'}
            </Link>
            </div>
            <div className='grid grid-cols-4 '>

              <div className='grid grid-cols-2'>
                <div className='text-right pr-2'>
                  {zone.original.openingQuantity === 0 ? '-' :
                    `${zone.original.openingQuantity?.toFixed(zone.original.godownDetails[0]?.itemDetails[0]?.noOfDecimalPlaces)} ${zone.original.godownDetails[0]?.itemDetails[0]?.unitCode}`}
                </div>
                <div>{zone.original.openingAmount === 0 ? '-' : zone.original.openingAmount?.toFixed(2)}</div>
              </div>



              <div className='grid grid-cols-2'>
                <div className='text-right pr-2'>

                  {zone.original.inwardQuantity === 0 ? '-' :
                    `${zone.original.inwardQuantity?.toFixed(zone.original.godownDetails[0]?.itemDetails[0]?.noOfDecimalPlaces)} ${zone.original.godownDetails[0]?.itemDetails[0]?.unitCode}`}
                </div>
                <div>{zone.original.inwardAmount === 0 ? '-' : zone.original.inwardAmount?.toFixed(2)}</div>
              </div>



              <div className='grid grid-cols-2'>
                <div className='text-right pr-2'>

                  {zone.original.outwardQuantity === 0 ? '-' :
                    `${zone.original.outwardQuantity?.toFixed(zone.original.godownDetails[0]?.itemDetails[0]?.noOfDecimalPlaces)} ${zone.original.godownDetails[0]?.itemDetails[0]?.unitCode}`}
                </div>
                <div>{zone.original.outwardAmount === 0 ? '-' : zone.original.outwardAmount?.toFixed(2)}</div>
              </div>


              <div className='grid grid-cols-2'>
                <div className='text-right pr-2'>

                  {zone.original.closingQuantity === 0 ? '-' :
                    `${zone.original.closingQuantity?.toFixed(zone.original.godownDetails[0]?.itemDetails[0]?.noOfDecimalPlaces)} ${zone.original.godownDetails[0]?.itemDetails[0]?.unitCode}`}
                </div>
                <div>{zone.original.closingAmount === 0 ? '-' : zone.original.closingAmount?.toFixed(2)}</div>
              </div>




            </div>
          </div>
          <div>
            {
              zone.original.godownDetails.map((godown: StockInHandGodownWiseSchema, godownIndex: number) => (
                <div key={godownIndex} className='text-sm italic text-gray-600    '>
                  <div>


                    <div className={cn
                      ('grid grid-cols-[1fr_2fr] text-center bg-gray-200', !godown.godownId ? 'font-semibold text-red-400' : '')
                    }>

                      <div className=' text-left pl-8 font-semibold'>
                        <Link to={'/reports/stock_summary/stock-in-hand-item-wise'} className='inline-block mr-2   hover:text-blue-700'
                        >
                          {
                            godown.godownId ?
                              `Godown: ${godown.godownName}`
                              :
                              `${godown.godownName}`
                          }
                        </Link>
                      </div>
                      <div className='grid grid-cols-4 font-bold  '>
                        <div className='grid grid-cols-2'>
                          <div className='text-right pr-2'>
                            {godown.openingQuantity === 0 ? '-' :
                              `${godown.openingQuantity?.toFixed(godown.itemDetails?.[0]?.noOfDecimalPlaces)} ${godown.itemDetails?.[0]?.unitCode}`}
                          </div>
                          <div>{godown.openingAmount === 0 ? '-' : godown.openingAmount?.toFixed(2)}</div>
                        </div>

                        <div className='grid grid-cols-2'>
                          <div className='text-right pr-2'>

                            {godown.inwardQuantity === 0 ? '-' :
                              `${godown.inwardQuantity?.toFixed(godown.itemDetails?.[0]?.noOfDecimalPlaces)} ${godown.itemDetails?.[0]?.unitCode}`}
                          </div>
                          <div>{godown.inwardAmount === 0 ? '-' : godown.inwardAmount?.toFixed(2)}</div>
                        </div>

                        <div className='grid grid-cols-2'>
                          <div className='text-right pr-2'>

                            {godown.outwardQuantity === 0 ? '-' :
                              `${godown.outwardQuantity?.toFixed(godown.itemDetails?.[0]?.noOfDecimalPlaces)} ${godown.itemDetails?.[0]?.unitCode}`}
                          </div>
                          <div>{godown.outwardAmount === 0 ? '-' : godown.outwardAmount?.toFixed(2)}</div>
                        </div>
                        <div className='grid grid-cols-2'>
                          <div className='text-right pr-2'>

                            {godown.closingQuantity === 0 ? '-' :
                              `${godown.closingQuantity?.toFixed(godown.itemDetails?.[0]?.noOfDecimalPlaces)} ${godown.itemDetails?.[0]?.unitCode}`}
                          </div>
                          <div>{godown.closingAmount === 0 ? '-' : godown.closingAmount?.toFixed(2)}</div>
                        </div>
                      </div>


                    </div>
                    <div>
                      {
                        godown.itemDetails.map((item, itemIndex) => (
                          <div key={itemIndex} className='text-sm text-gray-500  '>
                            <div className={cn
                              ('grid grid-cols-[1fr_2fr] text-center ', index % 2 === 0 ? 'bg-white' : 'bg-gray-100')
                            }>
                              <div className=' text-left pl-16 italic'>
                                <Link to={'/reports/stock_summary/stock-in-hand-item-wise'} className='inline-block mr-2   hover:text-blue-700'
                                >
                                  {`Item: ${item.itemName}`}
                                </Link>
                              </div>
                              <div className='grid grid-cols-4 '>
                                <div className='grid grid-cols-2'>
                                  <div className='text-right pr-2'>
                                    {item.openingQuantity === 0 ? '-' :
                                      `${item.openingQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                                  </div>
                                  <div>{item.openingAmount === 0 ? '-' : item.openingAmount?.toFixed(2)}</div>
                                </div>

                                <div className='grid grid-cols-2'>
                                  <div className='text-right pr-2'>

                                    {item.inwardQuantity === 0 ? '-' : `${item.inwardQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                                  </div>
                                  <div>{item.inwardAmount === 0 ? '-' : item.inwardAmount?.toFixed(2)}</div>
                                </div>

                                <div className='grid grid-cols-2'>
                                  <div className='text-right pr-2'>

                                    {item.outwardQuantity === 0 ? '-' : `${item.outwardQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                                  </div>
                                  <div>{item.outwardAmount === 0 ? '-' : item.outwardAmount?.toFixed(2)}</div>
                                </div>
                                <div className='grid grid-cols-2'>
                                  <div className='text-right pr-2'>

                                    {item.closingQuantity === 0 ? '-' : `${item.closingQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                                  </div>
                                  <div>{item.closingAmount === 0 ? '-' : item.closingAmount?.toFixed(2)}</div>
                                </div>
                              </div>

                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>


                </div>

              ))
            }

          </div>
        </div>
      ))}
    </div>

  </div>
}


const ReportFooter = ({ table }: { table: any }) => {
  const [unitCode, setUnitCode] = useState<string>('');
  const [noOfDecimalPlaces, setNoOfDecimalPlaces] = useState<number>(0);

  const total = {
    openingQuantity: 0,
    openingAmount: 0,
    inwardQuantity: 0,
    inwardAmount: 0,
    outwardQuantity: 0,
    outwardAmount: 0,
    closingQuantity: 0,
    closingAmount: 0,
    itemCount: 0,
  }


  table.getRowModel().rows.forEach((row: any) => {
    const item = row.original;
    total.openingQuantity += item.openingQuantity ?? 0;
    total.openingAmount += item.openingAmount ?? 0;
    total.inwardQuantity += item.inwardQuantity ?? 0;
    total.inwardAmount += item.inwardAmount ?? 0;
    total.outwardQuantity += item.outwardQuantity ?? 0;
    total.outwardAmount += item.outwardAmount ?? 0;
    total.closingQuantity += item.closingQuantity ?? 0;
    total.closingAmount += item.closingAmount ?? 0;
    total.itemCount += 1;
  })

  useEffect(() => {
    const uniqueUnitCode = new Set<string>();
    const noOfDecimalPlaces = new Set<number>();
    table.getRowModel().rows.forEach((row: any) => {
      const item = row.original;
      if (item.godownDetails.length > 0) {
        uniqueUnitCode.add(item.godownDetails[0]?.itemDetails[0]?.unitCode);
        noOfDecimalPlaces.add(item.godownDetails[0]?.itemDetails[0]?.noOfDecimalPlaces);
      }
    });
    const uniqueUnitCodeArray = Array.from(uniqueUnitCode);
    if (uniqueUnitCodeArray.length === 1) {
      setUnitCode('' + uniqueUnitCodeArray.join(', '));
      setNoOfDecimalPlaces(Array.from(noOfDecimalPlaces)[0]);
    } else {
      setUnitCode('~');
      setNoOfDecimalPlaces(2);
    }

  }, []);

  return (
    <div className=' grid grid-cols-[1fr_2fr] border-amber-950! bg-gray-100  text-center font-bold  '>
      <div className='text-accent-foreground border-2 text-right flex items-center pr-2 h-full justify-between'>
        <div className='pl-4 italic text-sm font-mono'>
          Item count: {table.getRowModel().rows.length}
        </div>
        <div>
          Total:
        </div>
      </div>
      <div className='grid grid-cols-4 border-b-2 border-l-0'>
        <div className=''>
          <div className='grid grid-cols-2'>
            <div className=' text-right pr-2'>{total.openingQuantity === 0 ? '-' : (total.openingQuantity.toFixed(noOfDecimalPlaces) + ' ' + unitCode)}  </div>
            <div className='border-l-2'>{total.openingAmount === 0 ? '-' : total.openingAmount}</div>
          </div>
        </div>
        <div>
          <div className='grid grid-cols-2'>
            <div className='border-l-2  text-right pr-2'>{total.inwardQuantity === 0 ? '-' : (total.inwardQuantity.toFixed(noOfDecimalPlaces) + ' ' + unitCode)}</div>
            <div className='border-l-2'>{total.inwardAmount === 0 ? '-' : total.inwardAmount}</div>
          </div>
        </div>

        <div>
          <div className='grid grid-cols-2'>
            <div className='border-l-2  text-right pr-2'>{total.outwardQuantity === 0 ? '-' : (total.outwardQuantity.toFixed(noOfDecimalPlaces) + ' ' + unitCode)}</div>
            <div className='border-l-2'>{total.outwardAmount === 0 ? '-' : total.outwardAmount}</div>
          </div>
        </div>
        <div>
          <div className='grid grid-cols-2'>
            <div className='border-l-2 text-right pr-2'>{total.closingQuantity === 0 ? '-' : (total.closingQuantity.toFixed(noOfDecimalPlaces) + ' ' + unitCode)}</div>
            <div className='border-l-2'>{total.closingAmount === 0 ? '-' : total.closingAmount}</div>
          </div>
        </div>



      </div>
    </div>
  )
}