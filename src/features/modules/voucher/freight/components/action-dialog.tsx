'use client'

import type { StockSummarySchema } from "../../stock_summary/data/schema"









interface Props {
  currentRow?: StockSummarySchema
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow }: Props) {


  const isEdit = !!currentRow






  return (
    <>
      {isEdit && (
        <div>Edit</div>
      )}
    </>
  )
}
