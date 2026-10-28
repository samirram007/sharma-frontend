export interface CsvColumn<T> {
  header: string
  accessor: keyof T
}

interface ExportToCsvProps<T> {
  columnData: CsvColumn<T>[]
  data: T[]
  fileName: string // Custom filename (overrides title-based default)
  /** When aborted, the file is not downloaded (used for cancellable exports). */
  signal?: AbortSignal
}

export default async function exportTableToCsv<T>({ columnData, data, fileName, signal }: ExportToCsvProps<T>) {
  // Build CSV header
  const headers = columnData.map((col) => col.header)
  let csv = headers.join(',') + '\r\n'

  // Build CSV rows
  data.forEach((row) => {
    // Skip if cancelled
    if (signal?.aborted) return

    const rowValues = columnData.map((col) => {
      const value = row[col.accessor as keyof T]
      // Handle null/undefined values
      if (value === null || value === undefined) return ''
      // Escape double quotes and wrap in quotes if contains comma, quote, or newline
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })

    csv += rowValues.join(',') + '\r\n'
  })

  // Only start the download if the export wasn't cancelled while building.
  if (signal?.aborted) return

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up object URL
  setTimeout(() => URL.revokeObjectURL(url), 100)
}