import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Clipboard,
  Printer,
} from 'lucide-react'

export interface ChartConfig {
  labelKey: string
  valueKey: string
  chartLabel: string
  formatLabel?: (value: string) => string
}

export interface ExportDropdownProps {
  tab: string
  title: string
  rawData: any[]
  columns: { header: string; accessor: string }[]
  formatRow: (r: any) => Record<string, string>
  computeTotals: (data: any[]) => Record<string, string>
  onExportPdf: (
    tab: string,
    title: string,
    columns: { header: string; accessor: string }[],
    data: any[],
    chartData?: {
      labels: string[]
      datasets: { label: string; data: number[] }[]
    },
  ) => void
  onExportExcel: (
    tab: string,
    title: string,
    columns: { header: string; accessor: string }[],
    data: any[],
  ) => void
  onDownloadCsv: (headers: string[], flatRows: string[][], tab: string) => void
  onDownloadJson: (data: unknown, tab: string) => void
  onCopyToClipboard: (text: string) => void
  chartConfig?: ChartConfig
}

export function ExportDropdown({
  tab,
  title,
  rawData,
  columns,
  formatRow,
  computeTotals,
  onExportPdf,
  onExportExcel,
  onDownloadCsv,
  onDownloadJson,
  onCopyToClipboard,
  chartConfig,
}: ExportDropdownProps) {
  const data = rawData.map(formatRow)
  const totalRow = computeTotals(rawData)
  const allData = [...data, totalRow]
  const headers = columns.map((c) => c.header)
  const flatRows = allData.map((row) =>
    columns.map((c) => String(row[c.accessor] ?? '')),
  )

  const chartData =
    chartConfig && rawData.length > 0
      ? {
          labels: rawData.map((r: any) => {
            const rawLabel = String(r[chartConfig.labelKey] ?? '')
            return chartConfig.formatLabel
              ? chartConfig.formatLabel(rawLabel)
              : rawLabel
          }),
          datasets: [
            {
              label: chartConfig.chartLabel,
              data: rawData.map(
                (r: any) => Number(r[chartConfig.valueKey]) ?? 0,
              ),
            },
          ],
        }
      : undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Download className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-medium">
          Export as
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => onExportPdf(tab, title, columns, allData, chartData)}
        >
          <FileText className="mr-2 h-4 w-4" />
          PDF Document
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onExportExcel(tab, title, columns, allData)}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel Workbook
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => onDownloadCsv(headers, flatRows, tab)}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV File
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onDownloadJson(allData, tab)}>
          <FileJson className="mr-2 h-4 w-4" />
          JSON File
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            const tsv = [
              headers.join('\t'),
              ...flatRows.map((r) => r.join('\t')),
            ].join('\n')
            onCopyToClipboard(tsv)
          }}
        >
          <Clipboard className="mr-2 h-4 w-4" />
          Copy to Clipboard
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
