import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toSentenceCase } from './removeEmptyStrings'
import { generateChartImage } from './export-common'

const MAX_PDF_CELL_CHARS = 180

function formatPdfCellValue(value: unknown): string {
  const normalized = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()

  if (normalized.length <= MAX_PDF_CELL_CHARS) {
    return normalized
  }

  return `${normalized.slice(0, MAX_PDF_CELL_CHARS - 1)}...`
}

export interface PdfSection<T = any> {
  title: string
  columnData: { header: string; accessor: keyof T }[]
  data: T[]
  chart?: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
    }[]
  }
}

export default function exportTableToPdf<T extends Record<string, any>>({
  title,
  columnData: columns,
  data,
  fileName = 'table.pdf',
  orientation = 'p',
  sections,
}: {
  title?: string
  columnData?: { header: string; accessor: keyof T }[]
  data?: T[]
  fileName?: string
  orientation?: 'p' | 'portrait' | 'l' | 'landscape'
  sections?: PdfSection[]
}) {
  const doc = new jsPDF({
    orientation: orientation,
  })

  const sectionDefinitions = sections || [
    {
      title: title || 'Report',
      columnData: columns || [],
      data: data || [],
    },
  ]

  let currentY = 15

  for (let i = 0; i < sectionDefinitions.length; i++) {
    const section = sectionDefinitions[i]

    // Add new page for each section after the first one
    if (i > 0) {
      doc.addPage()
      currentY = 15
    }

    // Section Title
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(section.title, 14, currentY)
    currentY += 10

    // Chart if provided
    if (section.chart) {
      const chartImage = generateChartImage(section.chart)
      if (chartImage) {
        // Determine dimensions based on orientation
        const pageWidth = doc.internal.pageSize.getWidth()
        const imgWidth = pageWidth - 28
        const imgHeight = (imgWidth * 500) / 800

        doc.addImage(chartImage, 'PNG', 14, currentY, imgWidth, imgHeight)
        currentY += imgHeight + 10
      }
    }

    // Table
    if (section.columnData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [section.columnData.map((c) => toSentenceCase(c.header))],
        body: section.data.map((row) =>
          section.columnData.map((c) => formatPdfCellValue(row[c.accessor])),
        ),
        styles: {
          fontSize: 8,
          overflow: 'ellipsize',
        },
        headStyles: {
          fillColor: [22, 160, 133],
        },
        margin: { left: 14, right: 14 },
      })

      // Update currentY for next possible element (though we usually addPage)
      currentY = (doc as any).lastAutoTable.finalY + 10
    }
  }

  doc.save(fileName)
}
