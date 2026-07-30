import { toSentenceCase } from './removeEmptyStrings'
import { generateChartImage } from './export-common'

export interface ExportColumn<T> {
    header: string
    accessor: keyof T
}

export interface ExcelSheet<T = any> {
    title: string
    columnData: ExportColumn<T>[]
    data: T[]
    chart?: {
        type: 'bar' | 'pie'
        labels: string[]
        datasets: {
            label: string
            data: number[]
            backgroundColor?: string
        }[]
    }
    /** Merge cell ranges: startRow, endRow, startCol, endCol (1-indexed) */
    mergeCells?: Array<{
        startRow: number
        endRow: number
        startCol: number
        endCol: number
    }>
}

interface ExportToExcelProps<T> {
    title?: string // Main title (used if single sheet or as default)
    fileName: string
    columnData?: ExportColumn<T>[] // Used for single sheet
    data?: T[] // Used for single sheet
    sheets?: ExcelSheet[] // Used for multiple sheets
}

export default async function exportTableToExcel<T>({
    title,
    fileName,
    columnData: columns,
    data,
    sheets,
}: ExportToExcelProps<T>) {
    const [ExcelJS, { saveAs }] = await Promise.all([
        import('exceljs').then((m) => m.default),
        import('file-saver'),
    ])

    const workbook = new ExcelJS.Workbook()

    const sheetDefinitions: ExcelSheet[] = sheets || [
        {
            title: title || 'Sheet1',
            columnData: (columns || []) as ExportColumn<any>[],
            data: data || [],
        },
    ]

    for (const sheetDef of sheetDefinitions) {
        const worksheet = workbook.addWorksheet(sheetDef.title)

        worksheet.columns = sheetDef.columnData.map((col) => ({
            header: toSentenceCase(col.header),
            key: col.accessor as string,
            width: 20,
        }))

        // Track which sheets have hyperlinks from other sheets
        const hyperlinkTargets: Array<{ sheetName: string; rowNumber: number }> = []

        sheetDef.data.forEach((row: any, rowIndex: number) => {
            const rowData: Record<string, any> = {}
            sheetDef.columnData.forEach((col) => {
                rowData[col.accessor as string] = row[col.accessor]
            })
            const newRow = worksheet.addRow(rowData)

            // Apply row-level styling based on markers
            if (row._isHeader) {
                // Voucher header row: gray background, bold
                newRow.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE0E0E0' }, // light gray
                    }
                    cell.font = { bold: true }
                })
            } else if (row._isSubtotal) {
                // Voucher subtotal row: blue-tinted background, bold
                newRow.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFDCE6F1' }, // light blue
                    }
                    cell.font = { bold: true }
                })
            } else if (row._isGrandTotal) {
                // Transporter grand total row: dark background, white bold text
                newRow.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF4472C4' }, // blue
                    }
                    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } } // white
                })
            }

            // Track hyperlink targets (rows with _sheetLink marker)
            if (row._sheetLink) {
                hyperlinkTargets.push({
                    sheetName: row._sheetLink,
                    rowNumber: rowIndex + 2, // +2 because row 1 is header, data starts at row 2
                })
            }
        })

        // Apply hyperlinks after all rows are added
        // Hyperlinks from summary sheet to per-transporter sheets
        if (hyperlinkTargets.length > 0) {
            hyperlinkTargets.forEach(({ sheetName, rowNumber }) => {
                const cell = worksheet.getCell(rowNumber, 1) // First column = Transporter name
                cell.value = {
                    text: String(cell.value || sheetName),
                    hyperlink: `#'${sheetName}'!A1`,
                }
                // Blue + underline to look like a clickable link
                cell.font = {
                    color: { argb: 'FF0563C1' },
                    underline: true,
                }
            })
        }

        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

        if (sheetDef.columnData.length > 0) {
            worksheet.autoFilter = {
                from: 'A1',
                to: `${String.fromCharCode(64 + sheetDef.columnData.length)}1`,
            }
        }

        // Add Chart if provided
        if (sheetDef.chart) {
            const chartImage = generateChartImage(sheetDef.chart)
            if (chartImage) {
                const imageId = workbook.addImage({
                    base64: chartImage,
                    extension: 'png',
                })
                
                // Position chart to the right of the data
                const startCol = sheetDef.columnData.length + 2
                
                worksheet.addImage(imageId, {
                    tl: { col: startCol, row: 1 },
                    ext: { width: 600, height: 350 }
                })
            }
        }

        // Apply merged cells for item grouping
        if (sheetDef.mergeCells && sheetDef.mergeCells.length > 0) {
            sheetDef.mergeCells.forEach(({ startRow, endRow, startCol, endCol }) => {
                if (startRow < endRow) {
                    const startCell = worksheet.getCell(startRow, startCol)
                    worksheet.mergeCells(startRow, startCol, endRow, endCol)
                    
                    // Style the merged cell - center vertically
                    startCell.alignment = {
                        vertical: 'middle',
                        horizontal: 'left',
                        wrapText: true,
                    }
                }
            })
        }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(
        new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        fileName,
    )
}