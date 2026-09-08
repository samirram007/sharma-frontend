import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { Main } from '@/layouts/components/main'
import type { FiscalYear, FiscalYearList } from '../fiscal_year/data/schema'
import { useUserFiscalYearMutation } from './data/queryOptions'

interface UserFiscalYearProps {
  data: FiscalYearList
}

const UserFiscalYear = ({ data: fiscalYearData }: UserFiscalYearProps) => {
  return (
    <Main className="container">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Fiscal Year</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the fiscal year you want to use for your transactions.
          This determines the accounting period for all vouchers, reports,
          and financial records.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {fiscalYearData.map((fy) => (
          <FiscalYearCard key={fy.id} fy={fy} />
        ))}
      </div>
    </Main>
  )
}

export default UserFiscalYear

const FiscalYearCard = ({ fy }: { fy: FiscalYear }) => {
  const { userFiscalYear } = useAuth()
  const isCurrent = userFiscalYear?.fiscalYearId === fy.id

  return (
    <div
      className="relative rounded-lg border transition-colors hover:border-primary/40 hover:bg-accent/30"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
        {/* Status badge */}
        <div className="shrink-0">
          <StatusBadge status={fy.status} />
        </div>

        {/* Fiscal year info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground truncate">
              {fy.name}
            </h2>
            {fy.startDate && fy.endDate && (
              <p className="text-xs text-muted-foreground">
                {formatDateRange(fy.startDate, fy.endDate)}
              </p>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0 flex items-center gap-2">
          {isCurrent ? (
            <CurrentlyUsingBadge />
          ) : (
            <UseButton fy={fy} />
          )}
        </div>
      </div>

      {/* Footer description */}
      <div className="border-t border-border/50 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
        {fy.company && (
          <>
            <span className="font-medium text-foreground">{fy.company.name}</span>
            {' — '}
          </>
        )}{' '}
        {isCurrent
          ? 'This is your currently active fiscal year for all transactions.'
          : 'Click "Use it" to set this fiscal year as your active period.'}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status.toLowerCase() === 'active'
  return (
    <span
      className={`ounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors
      ${isActive
        ? 'bg-green-500/10 text-green-500 dark:bg-green-500/15 dark:text-green-400'
        : 'bg-muted text-muted-foreground dark:bg-slate-800/50 dark:text-slate-400'
      }`}
    >
      {status}
    </span>
  )
}

function CurrentlyUsingBadge() {
  return (
    <span
      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary dark:bg-primary/20 dark:text-primary-foreground"
    >
      In use
    </span>
  )
}

function UseButton({ fy }: { fy: FiscalYear }) {
  const saveUserFiscalYear = useUserFiscalYearMutation()

  const handleOnClick = () => {
    saveUserFiscalYear.mutate(
      { fiscalYearId: fy.id },
      {
        onSuccess: () => {
          window.location.reload()
        },
      },
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleOnClick}
      disabled={saveUserFiscalYear.isPending}
      className="h-8 text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
    >
      {saveUserFiscalYear.isPending ? 'Setting…' : 'Use it'}
    </Button>
  )
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' }
  return `${start.toLocaleDateString('en-IN', options)} – ${end.toLocaleDateString('en-IN', options)}`
}
