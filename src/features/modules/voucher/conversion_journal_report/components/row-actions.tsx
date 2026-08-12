import { useNavigate } from '@tanstack/react-router'
import type { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import type { ConversionJournalReportSchema } from '../data/schema'

interface RowActionsProps {
  row: Row<ConversionJournalReportSchema>
}

const RowActions = ({ row }: RowActionsProps) => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
        title="Edit conversion journal"
        onClick={(e) => {
          e.stopPropagation()
          navigate({
            to: `/transactions/vouchers/conversion_journal/${row.original.id}`,
          })
        }}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

export default RowActions
