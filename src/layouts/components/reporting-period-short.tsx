import { useAuth } from '@/features/auth/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock } from 'lucide-react'
import { date_format } from '@/utils/removeEmptyStrings'
import { PeriodDetailsDialog } from '@/features/global/components/reporting-period/index.tsx'
import { useState } from 'react'

interface ReportingPeriodShortProps {
  className?: string
}

const ReportingPeriodShort = ({ className }: ReportingPeriodShortProps) => {
  const [open, setOpen] = useState(false)
  const { period } = useAuth()

  return (
    <>
      <PeriodDetailsDialog
        open={open}
        setopen={setOpen}
        hideTrigger
      />
      <Button
        variant="ghost"
        size="sm"
        className={`inline-flex items-center gap-1.5 px-2 text-xs whitespace-nowrap ${className ?? ''}`}
        onClick={() => setOpen(true)}
      >
        {period ? (
          <>
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {date_format(period.startDate!)} - {date_format(period.endDate!)}
            </span>
          </>
        ) : (
          <>
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Set Period</span>
          </>
        )}
      </Button>
    </>
  )
}

export default ReportingPeriodShort
