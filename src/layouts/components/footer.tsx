import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { findMenuTitleByRoute } from '@/layouts/lib/recent-pages'
import { IconClock } from '@tabler/icons-react'
import FooterCalculator from './footer-calculator'
import FiscalYearSelector from './fiscal-year-selector'

/** Pretty label for an arbitrary path segment. */
const toTitle = (value: string) =>
  value
    .replace(/^_+/, '')
    .replace(/\$/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())

export default function Footer() {
  const { user, menuTree, userFiscalYear } = useAuth()
  const { pathname } = useLocation()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const pageTitle = useMemo(() => {
    const menuTitle = findMenuTitleByRoute(menuTree ?? [], pathname)
    if (menuTitle) return menuTitle
    const segment = pathname.split('/').filter(Boolean).pop()
    return segment ? toTitle(segment) : 'Dashboard'
  }, [menuTree, pathname])

  const fiscalYearLabel = useMemo(() => {
    const fy = userFiscalYear
    if (!fy?.startDate || !fy?.endDate) return null
    const start = new Date(fy.startDate)
    const end = new Date(fy.endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return null
    return `FY ${start.getFullYear()}–${String(end.getFullYear()).slice(2)}`
  }, [userFiscalYear])

  const isDev = import.meta.env.DEV

  return (
    <footer
      data-testid="app-footer"
      className="sticky mb-2! bottom-0 left-0 right-0 z-10 mt-1 flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-white/60 bg-white/60 px-3 py-1.5 text-xs text-slate-600 shadow-sm backdrop-blur-md dark:border-white/8 dark:bg-card dark:text-slate-400"
    >
      {/* Brand / environment */}
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 shadow-[0_0_6px_rgb(59_130_246/0.5)]"
        />
        <span className="font-semibold tracking-tight text-slate-800 dark:text-slate-200">
          {import.meta.env.VITE_APP_NAME || 'AIPT'}
        </span>
        <span
          className={cn(
            'rounded-full border px-1.5 py-px font-mono text-[10px] uppercase tracking-wide',
            isDev
              ? 'border-amber-300/70 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
              : 'border-emerald-300/70 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
          )}
        >
          {isDev ? 'dev' : 'live'}
        </span>
      </div>

      {/* Current page context + fiscal year */}
      <div className="hidden min-w-0 items-center gap-2 sm:flex">
        <FiscalYearSelector visible={true} />
        <span className="h-4 w-px bg-slate-300/60 dark:bg-slate-700/60" />
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate font-semibold text-slate-700 dark:text-slate-200">
            {pageTitle}
          </span>
          <span className="hidden max-w-60 truncate font-mono text-[10px] text-muted-foreground md:inline">
            {pathname}
          </span>
        </div>
      </div>

      {/* Clock, fiscal year, signed-in user */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span
          className="hidden items-center gap-1 font-mono text-[11px] text-muted-foreground lg:flex"
          title={now.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        >
          <IconClock size={12} />
          {now.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
        {fiscalYearLabel && (
          <span className="hidden rounded-md border border-slate-200/80 bg-muted/40 px-1.5 py-px font-medium text-muted-foreground dark:border-white/10 md:inline">
            {fiscalYearLabel}
          </span>
        )}
        <span className="hidden min-w-0 flex-col items-end sm:flex">
          <span className="max-w-40 truncate font-medium text-slate-700 dark:text-slate-200">
            {user?.name ?? 'User'}
          </span>
          {user?.email && (
            <span className="max-w-40 truncate text-[10px] text-muted-foreground">
              {user.email}
            </span>
          )}
        </span>
        <span className="h-4 w-px bg-slate-300/60 dark:bg-slate-700/60" />
        <FooterCalculator />
        <Link
          to="/"
          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
        >
          Home
        </Link>
      </div>
    </footer>
  )
}
