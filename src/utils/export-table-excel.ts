import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
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

        sheetDef.data.forEach((row: any) => {
            const rowData: Record<string, any> = {}
            sheetDef.columnData.forEach((col) => {
                rowData[col.accessor as string] = row[col.accessor]
            })
            worksheet.addRow(rowData)
        })

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
    }

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(
        new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        fileName,
    )
}