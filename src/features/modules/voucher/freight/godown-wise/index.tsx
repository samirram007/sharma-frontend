import { Link } from '@tanstack/react-router'

import { useEffect, useState } from 'react'
import type { StockInHandListSchema } from '../../stock_summary/data/schema'
import { cn } from '@/lib/utils'
import { ExportDropdown, ExportOverlay } from '../shared/export-controls'
import { useExportJob } from '../shared/export-job'

const EXPORT_COLUMNS = [
  { header: 'Particulars', accessor: 'itemName' },
  { header: 'Opening Qty', accessor: 'openingQuantity' },
  { header: 'Opening Value', accessor: 'openingAmount' },
  { header: 'Inward Qty', accessor: 'inwardQuantity' },
  { header: 'Inward Value', accessor: 'inwardAmount' },
  { header: 'Outward Qty', accessor: 'outwardQuantity' },
  { header: 'Outward Value', accessor: 'outwardAmount' },
  { header: 'Closing Qty', accessor: 'closingQuantity' },
  { header: 'Closing Value', accessor: 'closingAmount' },
]

const qtyText = (quantity: number | null | undefined, item: any) =>
  !quantity
    ? '-'
    : `${quantity.toFixed(item.noOfDecimalPlaces ?? 2)} ${item.unitCode ?? ''}`

const valueText = (amount: number | null | undefined) =>
  !amount ? '-' : `₹${amount.toFixed(2)}`

const toExportRows = (rows: Array<StockInHandListSchema[number]>) =>
  rows.map((item) => ({
    itemName: item.itemName ?? '',
    openingQuantity: qtyText(item.openingQuantity, item),
    openingAmount: valueText(item.openingAmount),
    inwardQuantity: qtyText(item.inwardQuantity, item),
    inwardAmount: valueText(item.inwardAmount),
    outwardQuantity: qtyText(item.outwardQuantity, item),
    outwardAmount: valueText(item.outwardAmount),
    closingQuantity: qtyText(item.closingQuantity, item),
    closingAmount: valueText(item.closingAmount),
  }))

interface StockInHandProps {
  data: StockInHandListSchema
}

export default function FreightGodownWise({
  data: stockInHandListSchema,
}: StockInHandProps) {
  return (
    <>
      {stockInHandListSchema.length === 0 ? (
        <div className="text-center text-gray-500">No data available.</div>
      ) : (
        <ReportView data={stockInHandListSchema} />
      )}
    </>
  )
}

const ReportView = ({ data }: StockInHandProps) => {
  const {
    exportJob,
    eta,
    progress,
    runExport,
    handleRunInBackground,
    cancelExport,
  } = useExportJob<StockInHandListSchema[number]>({
    getPageRows: () => data,
    getFilteredRows: () => data,
    generate: async (action, rows) => {
      const exportRows = toExportRows(rows)
      if (action === 'pdf') {
        const { default: exportTableToPdf } =
          await import('@/utils/export-table-pdf')
        exportTableToPdf({
          title: 'Freight (Godown Wise)',
          columnData: EXPORT_COLUMNS,
          data: exportRows as Array<any>,
          fileName: 'freight-godown-wise.pdf',
          orientation: 'landscape',
        })
      } else {
        const { default: exportTableToExcel } =
          await import('@/utils/export-table-excel')
        exportTableToExcel({
          title: 'Freight (Godown Wise)',
          columnData: EXPORT_COLUMNS,
          data: exportRows as Array<any>,
          fileName: 'freight-godown-wise.xlsx',
        })
      }
    },
    successLabel: 'item',
  })

  return (
    <div className="w-full min-h-full grid grid-rows-[auto_auto_1fr]">
      <ReportHeader />
      <div className="flex items-center justify-end px-2 py-1 border-b">
        {data.length > 0 && (
          <ExportDropdown
            job={exportJob}
            pageCount={data.length}
            totalCount={data.length}
            onSelect={runExport}
          />
        )}
      </div>
      <div className="border-2 min-h-full overflow-auto">
        {data.map((item, index) => (
          <div
            key={index}
            className={cn(
              'grid grid-cols-[1.5fr_2.5fr] text-center',
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
            )}
          >
            <div className="text-left pl-2 font-semibold truncate flex items-center">
              <Link
                to={'/reports/stock_summary/stock-in-hand-item-wise'}
                className="inline-block mr-2 text-gray-700 hover:text-blue-700 truncate"
                title={item.itemName}
              >
                {item.itemName}
              </Link>
            </div>
            <div className="grid grid-cols-4">
              <div className="grid grid-cols-[1.2fr_1fr]">
                <div className="text-right pr-2 py-0.5 border-r-2">
                  {item.openingQuantity === 0
                    ? '-'
                    : `${item.openingQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                </div>
                <div className="py-0.5">
                  {item.openingAmount === 0
                    ? '-'
                    : `₹${item.openingAmount?.toFixed(2)}`}
                </div>
              </div>

              <div className="grid grid-cols-[1.2fr_1fr]">
                <div className="text-right pr-2 py-0.5 border-r-2">
                  {item.inwardQuantity === 0
                    ? '-'
                    : `${item.inwardQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                </div>
                <div className="py-0.5">
                  {item.inwardAmount === 0
                    ? '-'
                    : `₹${item.inwardAmount?.toFixed(2)}`}
                </div>
              </div>

              <div className="grid grid-cols-[1.2fr_1fr]">
                <div className="text-right pr-2 py-0.5 border-r-2">
                  {item.outwardQuantity === 0
                    ? '-'
                    : `${item.outwardQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                </div>
                <div className="py-0.5">
                  {item.outwardAmount === 0
                    ? '-'
                    : `₹${item.outwardAmount?.toFixed(2)}`}
                </div>
              </div>

              <div className="grid grid-cols-[1.2fr_1fr]">
                <div className="text-right pr-2 py-0.5 border-r-2">
                  {item.closingQuantity === 0
                    ? '-'
                    : `${item.closingQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                </div>
                <div className="py-0.5">
                  {item.closingAmount === 0
                    ? '-'
                    : `₹${item.closingAmount?.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ReportFooter data={data} />
      {exportJob && (
        <ExportOverlay
          job={exportJob}
          eta={eta}
          progress={progress}
          onBackground={handleRunInBackground}
          onCancel={cancelExport}
        />
      )}
    </div>
  )
}

const ReportHeader = () => {
  return (
    <div className="grid grid-cols-[1.5fr_2.5fr] bg-gray-100 text-center font-bold">
      <div className="text-accent-foreground border-2 text-left pl-2 font-stretch-ultra-expanded h-full flex items-center">
        PARTICULARS
      </div>
      <div className="grid grid-cols-4 border-2 border-l-0">
        <div>
          <div className="text-accent-foreground border-b-2">Opening</div>
          <div className="grid grid-cols-[1.2fr_1fr]">
            <div className="border-r-2">Qty</div>
            <div>Val</div>
          </div>
        </div>
        <div>
          <div className="text-accent-foreground border-b-2 border-l-2">
            Inward
          </div>
          <div className="grid grid-cols-[1.2fr_1fr]">
            <div className="border-r-2">Qty</div>
            <div>Val</div>
          </div>
        </div>
        <div>
          <div className="text-accent-foreground border-b-2 border-l-2">
            Outward
          </div>
          <div className="grid grid-cols-[1.2fr_1fr]">
            <div className="border-r-2">Qty</div>
            <div>Val</div>
          </div>
        </div>
        <div>
          <div className="text-accent-foreground border-b-2 border-l-2">
            Closing
          </div>
          <div className="grid grid-cols-[1.2fr_1fr]">
            <div className="border-r-2">Qty</div>
            <div>Val</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ReportFooter = ({ data }: StockInHandProps) => {
  const [unitCode, setUnitCode] = useState<string>('')
  const [noOfDecimalPlaces, setNoOfDecimalPlaces] = useState<number>(0)

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

  data.forEach((item) => {
    total.openingQuantity += item.openingQuantity ?? 0
    total.openingAmount += item.openingAmount ?? 0
    total.inwardQuantity += item.inwardQuantity ?? 0
    total.inwardAmount += item.inwardAmount ?? 0
    total.outwardQuantity += item.outwardQuantity ?? 0
    total.outwardAmount += item.outwardAmount ?? 0
    total.closingQuantity += item.closingQuantity ?? 0
    total.closingAmount += item.closingAmount ?? 0
    total.itemCount += 1
  })

  useEffect(() => {
    const uniqueUnitCode = new Set<string>()
    const noOfDecimalPlaces = new Set<number>()
    data.forEach((item) => {
      if (item.unitCode) {
        uniqueUnitCode.add(item.unitCode)
        noOfDecimalPlaces.add(item.noOfDecimalPlaces)
      }
    })
    const uniqueUnitCodeArray = Array.from(uniqueUnitCode)
    if (uniqueUnitCodeArray.length === 1) {
      setUnitCode('' + uniqueUnitCodeArray.join(', '))
      setNoOfDecimalPlaces(Array.from(noOfDecimalPlaces)[0])
    } else {
      setUnitCode('~')
      setNoOfDecimalPlaces(2)
    }
  }, [])

  return (
    <div className="grid grid-cols-[1.5fr_2.5fr] bg-gray-100 text-center font-bold">
      <div className="text-accent-foreground border-2 text-right flex items-center pr-2 h-full justify-between">
        <div className="pl-4 italic text-sm font-mono">
          Item count: {data.length}
        </div>
        <div>Total:</div>
      </div>
      <div className="grid grid-cols-4 border-b-2 border-l-0">
        <div className="grid grid-cols-[1.2fr_1fr]">
          <div className="text-right pr-2 border-r-2">
            {total.openingQuantity === 0
              ? '-'
              : total.openingQuantity.toFixed(noOfDecimalPlaces) +
                ' ' +
                unitCode}
          </div>
          <div>
            {total.openingAmount === 0 ? '-' : `₹${total.openingAmount}`}
          </div>
        </div>
        <div className="grid grid-cols-[1.2fr_1fr]">
          <div className="text-right pr-2 border-r-2">
            {total.inwardQuantity === 0
              ? '-'
              : total.inwardQuantity.toFixed(noOfDecimalPlaces) +
                ' ' +
                unitCode}
          </div>
          <div>{total.inwardAmount === 0 ? '-' : `₹${total.inwardAmount}`}</div>
        </div>
        <div className="grid grid-cols-[1.2fr_1fr]">
          <div className="text-right pr-2 border-r-2">
            {total.outwardQuantity === 0
              ? '-'
              : total.outwardQuantity.toFixed(noOfDecimalPlaces) +
                ' ' +
                unitCode}
          </div>
          <div>
            {total.outwardAmount === 0 ? '-' : `₹${total.outwardAmount}`}
          </div>
        </div>
        <div className="grid grid-cols-[1.2fr_1fr]">
          <div className="text-right pr-2 border-r-2">
            {total.closingQuantity === 0
              ? '-'
              : total.closingQuantity.toFixed(noOfDecimalPlaces) +
                ' ' +
                unitCode}
          </div>
          <div>
            {total.closingAmount === 0 ? '-' : `₹${total.closingAmount}`}
          </div>
        </div>
      </div>
    </div>
  )
}
