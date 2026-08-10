import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Activity, ChevronDown, Lock, PackageX, Warehouse } from 'lucide-react'
import { ExportDropdown } from '@/components/export-dropdown'
import { cn } from '@/lib/utils'
import { date_format } from '@/utils/removeEmptyStrings'
import type {
  ClosingStockGodownDetailsSchema,
  ClosingStockItemSchema,
  ClosingStockSchema,
} from '../data/schema'

type ClosingStockView = 'godown' | 'batch'

interface ClosingStockProps {
  data: ClosingStockSchema
  view: ClosingStockView
  onViewChange: (view: ClosingStockView) => void
}

export default function ClosingStock({ data, view, onViewChange }: ClosingStockProps) {
  if (!data) {
    return <div className='text-center text-gray-500'>No data available.</div>
  }

  const batchWiseItems = useMemo(
    () => (view === 'batch' ? buildBatchWiseItems(data.items) : []),
    [view, data.items]
  )

  // Export rows follow the active view's grouping (Item → Godown → Batch vs
  // Item → Batch → Godown) so the file matches what is on screen. Batch-wise
  // reuses the batchWiseItems memo instead of re-grouping the payload.
  const exportRows = useMemo(
    () => (view === 'batch' ? flattenBatchWise(batchWiseItems) : flattenGodownWise(data.items)),
    [view, batchWiseItems, data.items]
  )

  const exportPdf = useCallback(
    async (tab: string, title: string, columnData: { header: string; accessor: string }[], exportData: any[]) => {
      const { default: exportTableToPdf } = await import('@/utils/export-table-pdf')
      exportTableToPdf({
        fileName: `closing-stock-${tab}.pdf`,
        sections: [{ title, columnData, data: exportData }],
      })
    },
    []
  )

  const exportExcel = useCallback(
    async (tab: string, title: string, columnData: { header: string; accessor: string }[], exportData: any[]) => {
      const { default: exportTableToExcel } = await import('@/utils/export-table-excel')
      await exportTableToExcel({
        title,
        columnData,
        data: exportData,
        fileName: `closing-stock-${tab}.xlsx`,
      })
    },
    []
  )

  const downloadBlob = useCallback((content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const downloadCsv = useCallback((headers: string[], flatRows: string[][], tab: string) => {
    const bom = '\uFEFF'
    const csv = bom + [headers.join(','), ...flatRows.map((row) => row.join(','))].join('\n')
    downloadBlob(csv, `closing-stock-${tab}.csv`, 'text/csv;charset=utf-8;')
  }, [downloadBlob])

  const downloadJson = useCallback((exportData: unknown, tab: string) => {
    downloadBlob(JSON.stringify(exportData, null, 2), `closing-stock-${tab}.json`, 'application/json')
  }, [downloadBlob])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }, [])

  return (
    <div className='grid h-[72vh] w-full grid-rows-[auto_auto_auto_1fr_auto]'>
      <SourceBanner data={data} />
      <SummaryStrip
        data={data}
        view={view}
        onViewChange={onViewChange}
        exportControls={
          data.items.length > 0 ? (
            <ExportDropdown
              tab={view}
              title={`Closing Stock — ${view === 'batch' ? 'Batch Wise' : 'Godown Wise'}`}
              rawData={exportRows}
              columns={closingStockExportColumns}
              formatRow={formatClosingStockExportRow}
              computeTotals={computeClosingStockTotals}
              onExportPdf={exportPdf}
              onExportExcel={exportExcel}
              onDownloadCsv={downloadCsv}
              onDownloadJson={downloadJson}
              onCopyToClipboard={copyToClipboard}
            />
          ) : null
        }
      />
      <ReportHeader />
      <div className='overflow-y-auto border-2 border-t-0'>
        {data.items.length === 0 ? (
          <EmptyState data={data} />
        ) : view === 'batch' ? (
          batchWiseItems.map((item, index) => (
            <BatchWiseItemRow key={item.itemId} item={item} index={index} />
          ))
        ) : (
          data.items.map((item, index) => (
            <ItemRow key={item.itemId} item={item} index={index} />
          ))
        )}
      </div>
      <ReportFooter data={data} />
    </div>
  )
}

const SourceBanner = ({ data }: { data: ClosingStockSchema }) => {
  const isFrozen = data.source === 'closing_journal'

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 border-2 px-3 py-2 text-sm transition-colors',
        isFrozen
          ? 'border-emerald-300/70 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/30'
          : 'border-amber-300/70 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/30'
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide text-white',
          isFrozen ? 'bg-emerald-600' : 'bg-amber-600'
        )}
      >
        {isFrozen ? <Lock size={12} /> : <Activity size={12} />}
        {isFrozen ? 'Closing Journal' : 'Running / Live'}
      </span>
      <span className='min-w-0 text-muted-foreground'>
        {isFrozen ? (
          <>
            Voucher{' '}
            <span className='font-mono font-semibold text-foreground'>
              #{data.closingVoucherNo}
            </span>{' '}
            dated {data.closingDate ? date_format(data.closingDate) : '—'} — stock frozen at fiscal
            year end.
          </>
        ) : (
          <>
            No closing stock journal (CLSSK) found for this fiscal year — closing stock is computed
            live from stock movements{data.asOfDate ? (
              <>
                {' '}
                as of{' '}
                <span className='font-semibold text-foreground'>{date_format(data.asOfDate)}</span>
              </>
            ) : null}
            .
          </>
        )}
      </span>
      {data.fiscalYear && (
        <span className='ml-auto shrink-0 font-medium text-foreground/80'>
          FY: <span className='font-mono'>{data.fiscalYear.name}</span>
        </span>
      )}
    </div>
  )
}

const SummaryStrip = ({
  data,
  view,
  onViewChange,
  exportControls,
}: {
  data: ClosingStockSchema
  view: ClosingStockView
  onViewChange: (view: ClosingStockView) => void
  exportControls?: ReactNode
}) => (
  <div className='flex flex-wrap items-center gap-3 border-2 border-t-0 px-3 py-1.5 text-xs text-muted-foreground'>
    <span>
      <span className='font-semibold tabular-nums text-foreground'>{data.totalItems}</span> items
    </span>
    <span className='text-muted-foreground/40'>•</span>
    <span>
      Total value:{' '}
      <span className='font-semibold tabular-nums text-foreground'>
        {(data.totalAmount ?? 0).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </span>
    <div className='ml-auto flex items-center gap-2'>
      {exportControls}
      <div className='flex items-center rounded-md border bg-background p-0.5'>
      {(['godown', 'batch'] as const).map((option) => (
        <button
          key={option}
          type='button'
          disabled={data.items.length === 0}
          onClick={() => onViewChange(option)}
          className={cn(
            'rounded px-2.5 py-1 font-medium transition-colors disabled:opacity-50',
            view === option
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
            {option === 'godown' ? 'Godown-wise' : 'Batch-wise'}
          </button>
        ))}
      </div>
    </div>
  </div>
)

const ReportHeader = () => (
  <div className='grid grid-cols-[1fr_3fr] border-2 bg-gray-100 text-center font-bold dark:bg-zinc-900'>
    <div className='flex items-center border-r-2 px-2 text-left'>PARTICULARS</div>
    <div className='grid grid-cols-3'>
      <div className='border-l-2'>Closing Qty</div>
      <div className='border-l-2'>Rate</div>
      <div className='border-l-2'>Value</div>
    </div>
  </div>
)

const ItemHeaderRow = ({
  itemName,
  closingQuantity,
  closingAmount,
  rate,
  noOfDecimalPlaces,
  unitCode,
  hasDetails,
  expanded,
  onToggle,
}: {
  itemName: string
  closingQuantity?: number | null
  closingAmount?: number | null
  rate?: number | null
  noOfDecimalPlaces: number
  unitCode?: string | null
  hasDetails: boolean
  expanded: boolean
  onToggle: () => void
}) => (
  <div
    role={hasDetails ? 'button' : undefined}
    tabIndex={hasDetails ? 0 : undefined}
    onClick={onToggle}
    onKeyDown={
      hasDetails
        ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onToggle()
            }
          }
        : undefined
    }
    className={cn(
      'grid grid-cols-[1fr_3fr] items-center text-center font-semibold transition-colors',
      hasDetails && 'cursor-pointer hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline-none'
    )}
  >
    <div className='flex min-w-0 items-center gap-2 px-2 text-left'>
      {hasDetails && (
        <ChevronDown
          size={14}
          className={cn(
            'shrink-0 text-muted-foreground transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        />
      )}
      <span className='truncate'>{itemName}</span>
    </div>
    <div className='grid grid-cols-3 tabular-nums'>
      <div className='border-l-2 px-2 text-right'>
        {formatQty(closingQuantity, noOfDecimalPlaces, unitCode)}
      </div>
      <div className='border-l-2 px-2 text-right'>{formatRate(rate)}</div>
      <div className='border-l-2 px-2 text-right'>{formatAmount(closingAmount)}</div>
    </div>
  </div>
)

const ItemRow = ({ item, index }: { item: ClosingStockItemSchema; index: number }) => {
  const [expanded, setExpanded] = useState(true)
  const hasDetails = item.godownDetails.length > 0

  return (
    <div className={cn(index % 2 === 0 ? 'bg-background' : 'bg-muted/40')}>
      <ItemHeaderRow
        itemName={item.itemName}
        closingQuantity={item.closingQuantity}
        closingAmount={item.closingAmount}
        rate={item.rate}
        noOfDecimalPlaces={item.noOfDecimalPlaces}
        unitCode={item.unitCode}
        hasDetails={hasDetails}
        expanded={expanded}
        onToggle={() => hasDetails && setExpanded((value) => !value)}
      />
      {hasDetails && expanded && (
        <div className='pb-1'>
          {item.godownDetails.map((godown, godownIndex) => (
            <GodownRow
              key={`${godown.godownId ?? godown.godownName}-${godownIndex}`}
              item={item}
              godown={godown}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const GodownRow = ({
  item,
  godown,
}: {
  item: ClosingStockItemSchema
  godown: ClosingStockGodownDetailsSchema
}) => (
  <div className='text-sm italic text-muted-foreground'>
    <div className='grid grid-cols-[1fr_3fr] text-center'>
      <div className='flex min-w-0 items-center gap-1.5 px-2 pl-8 text-left'>
        <Warehouse size={12} className='shrink-0' />
        <span className='truncate font-semibold not-italic text-foreground/80'>
          {godown.godownName ?? '—'}
        </span>
      </div>
      <div className='grid grid-cols-3 tabular-nums'>
        <div className='border-l-2 px-2 text-right'>
          {formatQty(godown.closingQuantity, item.noOfDecimalPlaces, item.unitCode)}
        </div>
        <div className='border-l-2 px-2 text-right'>—</div>
        <div className='border-l-2 px-2 text-right'>{formatAmount(godown.closingAmount)}</div>
      </div>
    </div>
    {godown.batchDetails?.length ? (
      <div className='pb-1'>
        {godown.batchDetails.map((batch, batchIndex) => (
          <div
            key={`${batch.batchNo}-${batch.mfgDate}-${batchIndex}`}
            className='grid grid-cols-[1fr_3fr] text-center text-xs'
          >
            <div className='flex min-w-0 flex-wrap items-center gap-x-2 px-2 pl-12 text-left not-italic'>
              <span className='font-mono font-semibold uppercase text-foreground/80'>
                {batch.batchNo ?? 'No batch'}
              </span>
              {batch.mfgDate && <span>MFG: {date_format(batch.mfgDate)}</span>}
              {batch.expiryDate && <span>Exp: {date_format(batch.expiryDate)}</span>}
            </div>
            <div className='grid grid-cols-3 tabular-nums'>
              <div className='border-l-2 px-2 text-right'>
                {formatQty(batch.quantity, item.noOfDecimalPlaces, item.unitCode)}
              </div>
              <div className='border-l-2 px-2 text-right'>{formatRate(batch.rate)}</div>
              <div className='border-l-2 px-2 text-right'>{formatAmount(batch.amount)}</div>
            </div>
          </div>
        ))}
      </div>
    ) : null}
  </div>
)

const BatchWiseItemRow = ({
  item,
  index,
}: {
  item: BatchWiseItemSchema
  index: number
}) => {
  const [expanded, setExpanded] = useState(true)
  const hasDetails = item.batchDetails.length > 0

  return (
    <div className={cn(index % 2 === 0 ? 'bg-background' : 'bg-muted/40')}>
      <ItemHeaderRow
        itemName={item.itemName}
        closingQuantity={item.closingQuantity}
        closingAmount={item.closingAmount}
        rate={item.rate}
        noOfDecimalPlaces={item.noOfDecimalPlaces}
        unitCode={item.unitCode}
        hasDetails={hasDetails}
        expanded={expanded}
        onToggle={() => hasDetails && setExpanded((value) => !value)}
      />
      {hasDetails && expanded && (
        <div className='pb-1'>
          {item.batchDetails.map((batch, batchIndex) => (
            <BatchRow
              key={`${batch.batchNo}-${batch.mfgDate}-${batchIndex}`}
              item={item}
              batch={batch}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const BatchRow = ({ item, batch }: { item: BatchWiseItemSchema; batch: BatchWiseBatchSchema }) => (
  <div className='text-sm italic text-muted-foreground'>
    <div className='grid grid-cols-[1fr_3fr] text-center'>
      <div className='flex min-w-0 flex-wrap items-center gap-x-2 px-2 pl-8 text-left not-italic'>
        <span className='font-mono font-semibold uppercase text-foreground/80'>
          {batch.batchNo ?? 'No batch'}
        </span>
        {batch.mfgDate && <span>MFG: {date_format(batch.mfgDate)}</span>}
        {batch.expiryDate && <span>Exp: {date_format(batch.expiryDate)}</span>}
      </div>
      <div className='grid grid-cols-3 tabular-nums'>
        <div className='border-l-2 px-2 text-right'>
          {formatQty(batch.quantity, item.noOfDecimalPlaces, item.unitCode)}
        </div>
        <div className='border-l-2 px-2 text-right'>{formatRate(batch.rate)}</div>
        <div className='border-l-2 px-2 text-right'>{formatAmount(batch.amount)}</div>
      </div>
    </div>
    {batch.godownDetails.map((godown, godownIndex) => (
      <div
        key={`${godown.godownId ?? godown.godownName}-${godownIndex}`}
        className='grid grid-cols-[1fr_3fr] text-center text-xs'
      >
        <div className='flex min-w-0 items-center gap-1.5 px-2 pl-12 text-left not-italic'>
          <Warehouse size={12} className='shrink-0' />
          <span className='truncate'>{godown.godownName ?? '—'}</span>
        </div>
        <div className='grid grid-cols-3 tabular-nums'>
          <div className='border-l-2 px-2 text-right'>
            {formatQty(godown.quantity, item.noOfDecimalPlaces, item.unitCode)}
          </div>
          <div className='border-l-2 px-2 text-right'>—</div>
          <div className='border-l-2 px-2 text-right'>{formatAmount(godown.amount)}</div>
        </div>
      </div>
    ))}
  </div>
)

const EmptyState = ({ data }: { data: ClosingStockSchema }) => (
  <div className='flex flex-col items-center justify-center gap-2 p-10 text-center text-muted-foreground'>
    <PackageX size={28} className='text-muted-foreground/50' />
    <p className='text-sm font-medium'>No closing stock entries found.</p>
    <p className='text-xs'>
      {data.source === 'closing_journal'
        ? 'The closing stock journal for this fiscal year has no stock entries.'
        : 'There is no stock movement recorded for this fiscal year.'}
    </p>
  </div>
)

const ReportFooter = ({ data }: { data: ClosingStockSchema }) => {
  const units = Array.from(new Set(data.items.map((item) => item.unitCode).filter(Boolean)))
  const unitCode = units.length === 1 ? units[0] : '~'
  const decimals = units.length === 1 ? data.items[0]?.noOfDecimalPlaces ?? 2 : 2

  return (
    <div className='grid grid-cols-[1fr_3fr] border-2 border-t-0 bg-gray-100 text-center font-bold dark:bg-zinc-900'>
      <div className='flex items-center justify-between gap-2 px-2 text-left'>
        <span className='font-mono text-xs font-normal italic'>Items: {data.totalItems}</span>
        <span>Total</span>
      </div>
      <div className='grid grid-cols-3 tabular-nums'>
        <div className='border-l-2 px-2 text-right'>
          {formatQty(data.totalQuantity, decimals, unitCode)}
        </div>
        <div className='border-l-2 px-2 text-right'>—</div>
        <div className='border-l-2 px-2 text-right'>{formatAmount(data.totalAmount)}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Batch-wise derived types & grouping helper
// ─────────────────────────────────────────────────────────────

interface BatchWiseGodownSchema {
  godownId: number | null
  godownName: string | null
  godownCode: string | null
  quantity: number | null
  amount: number | null
}

interface BatchWiseBatchSchema {
  batchNo: string | null
  mfgDate: string | null
  expiryDate: string | null
  quantity: number | null
  amount: number | null
  rate: number | null
  godownDetails: BatchWiseGodownSchema[]
}

interface BatchWiseItemSchema {
  itemId: number
  itemName: string
  unitCode: string | null | undefined
  unitName: string | null | undefined
  noOfDecimalPlaces: number
  closingQuantity: number | null | undefined
  closingAmount: number | null | undefined
  rate: number | null | undefined
  batchDetails: BatchWiseBatchSchema[]
}

/**
 * Re-group the closing stock payload from Item → Godown → Batch into
 * Item → Batch → Godown. Godowns without batch details are bucketed under a
 * synthetic "No batch" entry so no quantity is lost.
 */
function buildBatchWiseItems(items: ClosingStockItemSchema[]): BatchWiseItemSchema[] {
  return items.map((item) => {
    const batchMap = new Map<string, BatchWiseBatchSchema>()

    item.godownDetails.forEach((godown) => {
      const batchEntries = godown.batchDetails?.length
        ? godown.batchDetails
        : [
            {
              batchNo: null,
              mfgDate: null,
              expiryDate: null,
              quantity: godown.closingQuantity,
              amount: godown.closingAmount,
              rate: null,
            },
          ]

      batchEntries.forEach((batch) => {
        const key = `${batch.batchNo ?? ''}__${batch.mfgDate ?? ''}__${batch.expiryDate ?? ''}`

        let group = batchMap.get(key)
        if (!group) {
          group = {
            batchNo: batch.batchNo ?? null,
            mfgDate: batch.mfgDate ?? null,
            expiryDate: batch.expiryDate ?? null,
            quantity: 0,
            amount: 0,
            rate: batch.rate ?? null,
            godownDetails: [],
          }
          batchMap.set(key, group)
        }

        group.quantity = (group.quantity ?? 0) + (batch.quantity ?? 0)
        group.amount = (group.amount ?? 0) + (batch.amount ?? 0)
        group.godownDetails.push({
          godownId: godown.godownId ?? null,
          godownName: godown.godownName ?? null,
          godownCode: godown.godownCode ?? null,
          quantity: batch.quantity ?? null,
          amount: batch.amount ?? null,
        })
      })
    })

    // Blended rate so the Rate column reconciles with the summed quantity/value;
    // sorted by batch number (untagged batches last) for deterministic ordering.
    const batchDetails = Array.from(batchMap.values())
      .map((group) => {
        if (group.quantity && group.amount) {
          group.rate = Math.round((group.amount / group.quantity) * 100) / 100
        }

        return group
      })
      .sort((a, b) => {
        const aKey = (a.batchNo ?? '\uffff').toUpperCase()
        const bKey = (b.batchNo ?? '\uffff').toUpperCase()
        if (aKey !== bKey) return aKey < bKey ? -1 : 1

        return (a.mfgDate ?? '').localeCompare(b.mfgDate ?? '')
      })

    return {
      itemId: item.itemId,
      itemName: item.itemName,
      unitCode: item.unitCode,
      unitName: item.unitName,
      noOfDecimalPlaces: item.noOfDecimalPlaces,
      closingQuantity: item.closingQuantity,
      closingAmount: item.closingAmount,
      rate: item.rate,
      batchDetails,
    }
  })
}

// ─────────────────────────────────────────────────────────────
//  Export helpers (ExportDropdown pattern)
// ─────────────────────────────────────────────────────────────

interface ClosingStockExportRow {
  itemName: string
  unitCode: string | null | undefined
  godownName: string | null | undefined
  batchNo: string | null | undefined
  mfgDate: string | null | undefined
  expiryDate: string | null | undefined
  quantity: number | null | undefined
  rate: number | null | undefined
  amount: number | null | undefined
}

const closingStockExportColumns = [
  { header: 'Item Name', accessor: 'itemName' as const },
  { header: 'Unit', accessor: 'unitCode' as const },
  { header: 'Godown', accessor: 'godownName' as const },
  { header: 'Batch No', accessor: 'batchNo' as const },
  { header: 'Mfg Date', accessor: 'mfgDate' as const },
  { header: 'Expiry Date', accessor: 'expiryDate' as const },
  { header: 'Qty', accessor: 'quantity' as const },
  { header: 'Rate', accessor: 'rate' as const },
  { header: 'Amount', accessor: 'amount' as const },
]

/**
 * Flat rows in Item → Godown → Batch order (one row per batch line; godowns
 * without batch details export a single row with the godown-level quantities).
 */
function flattenGodownWise(items: ClosingStockItemSchema[]): ClosingStockExportRow[] {
  const rows: ClosingStockExportRow[] = []

  for (const item of items) {
    // Item with no godown breakdown — export its item-level quantities.
    if (item.godownDetails.length === 0) {
      rows.push({
        itemName: item.itemName,
        unitCode: item.unitCode,
        godownName: null,
        batchNo: null,
        mfgDate: null,
        expiryDate: null,
        quantity: item.closingQuantity,
        rate: item.rate,
        amount: item.closingAmount,
      })
      continue
    }

    for (const godown of item.godownDetails) {
      const batches = godown.batchDetails?.length ? godown.batchDetails : [null]

      for (const batch of batches) {
        rows.push({
          itemName: item.itemName,
          unitCode: item.unitCode,
          godownName: godown.godownName,
          batchNo: batch?.batchNo ?? null,
          mfgDate: batch?.mfgDate ?? null,
          expiryDate: batch?.expiryDate ?? null,
          quantity: batch?.quantity ?? godown.closingQuantity,
          rate: batch?.rate ?? null,
          amount: batch?.amount ?? godown.closingAmount,
        })
      }
    }
  }

  return rows
}

/**
 * Flat rows in Item → Batch → Godown order, from the pre-built batch-wise grouping.
 */
function flattenBatchWise(items: BatchWiseItemSchema[]): ClosingStockExportRow[] {
  const rows: ClosingStockExportRow[] = []

  for (const item of items) {
    for (const batch of item.batchDetails) {
      for (const godown of batch.godownDetails) {
        rows.push({
          itemName: item.itemName,
          unitCode: item.unitCode,
          godownName: godown.godownName,
          batchNo: batch.batchNo,
          mfgDate: batch.mfgDate,
          expiryDate: batch.expiryDate,
          quantity: godown.quantity,
          rate: batch.rate,
          amount: godown.amount,
        })
      }
    }
  }

  return rows
}

function formatClosingStockExportRow(row: ClosingStockExportRow): Record<string, string> {
  return {
    itemName: row.itemName,
    unitCode: row.unitCode ?? '',
    godownName: row.godownName ?? '',
    batchNo: row.batchNo ?? '',
    mfgDate: row.mfgDate ? date_format(row.mfgDate) : '',
    expiryDate: row.expiryDate ? date_format(row.expiryDate) : '',
    quantity: row.quantity != null ? row.quantity.toFixed(2) : '',
    rate: row.rate != null ? row.rate.toFixed(2) : '',
    amount: row.amount != null ? row.amount.toFixed(2) : '',
  }
}

function computeClosingStockTotals(rows: ClosingStockExportRow[]): Record<string, string> {
  const totalQty = rows.reduce((sum, row) => sum + (row.quantity ?? 0), 0)
  const totalAmount = rows.reduce((sum, row) => sum + (row.amount ?? 0), 0)

  return {
    itemName: 'TOTAL',
    unitCode: '',
    godownName: '',
    batchNo: '',
    mfgDate: '',
    expiryDate: '',
    quantity: totalQty.toFixed(2),
    rate: '',
    amount: totalAmount.toFixed(2),
  }
}

function formatQty(value?: number | null, decimals?: number | null, unitCode?: string | null): string {
  if (!value) return '-'
  const unit = unitCode ? ` ${unitCode}` : ''
  return `${value.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals ?? 2,
  })}${unit}`
}

function formatRate(rate?: number | null): string {
  if (!rate) return '-'
  return rate.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

function formatAmount(amount?: number | null): string {
  if (!amount) return '-'
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
