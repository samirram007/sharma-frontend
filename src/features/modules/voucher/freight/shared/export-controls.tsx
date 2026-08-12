import { useEffect, useRef, useState } from 'react'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { ExportJob, ExportScope } from './export-job'
import { formatEta } from './export-job'

export interface ExportItem {
  action: string
  label: string
}

export interface ExportGroup {
  label: string
  items: Array<ExportItem>
}

interface ExportDropdownProps {
  job: ExportJob | null
  pageCount: number
  /** Total matching records for the "All records (filtered)" group. */
  totalCount: number | null
  onSelect: (action: string, scope: ExportScope) => void
  /** Optional additional groups (e.g. "More formats" with variant exports). */
  extraGroups?: Array<ExportGroup>
  /** When set, the All-records preview re-fetches the live filtered count
   *  from the server before the user can confirm — used by server-paginated
   *  grids where the dropdown count may be stale. The signal aborts when the
   *  preview dialog closes, so implementations should pass it along. */
  fetchLiveCount?: (signal?: AbortSignal) => Promise<number | null>
  /** Pages at/above this row count get a confirm preview for "This page"
   *  exports too (default 100). Smaller pages export immediately. */
  pagePreviewThreshold?: number
}

const GroupHeader = ({ children }: { children: React.ReactNode }) => (
  <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
    {children}
  </DropdownMenuLabel>
)

const recordWord = (count: number) => (count === 1 ? 'record' : 'records')

/**
 * Standard export dropdown used by every freight grid: "This page" and
 * "All records (filtered)", each in PDF or Excel, plus optional extra groups.
 * While a job runs the trigger shows a spinner and is disabled.
 */
export function ExportDropdown({
  job,
  pageCount,
  totalCount,
  onSelect,
  extraGroups,
  fetchLiveCount,
  pagePreviewThreshold = 100,
}: ExportDropdownProps) {
  // Exports are previewed first when they cover a lot of rows: "All records"
  // always, "This page" only when the page is large. The user sees the count
  // and confirms before the (possibly big) export starts.
  const [pending, setPending] = useState<{
    action: string
    formatLabel: string
    scope: ExportScope
  } | null>(null)
  const [liveCount, setLiveCount] = useState<number | null>(null)
  const [counting, setCounting] = useState(false)
  // Guards against a slow count response racing a re-opened preview.
  const countRequestRef = useRef(0)
  // Aborts the in-flight live-count request once the preview dialog closes.
  const countAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => countAbortRef.current?.abort()
  }, [])

  const openPreview = (action: string, scope: ExportScope) => {
    const formatLabel = action.startsWith('excel') ? 'Excel' : 'PDF'
    // Small pages export immediately; large pages get a confirmation.
    if (scope === 'page' && pageCount < pagePreviewThreshold) {
      onSelect(action, scope)
      return
    }
    const requestId = ++countRequestRef.current
    // Any previous count request is stale once a new preview opens.
    countAbortRef.current?.abort()
    const countAbort = new AbortController()
    countAbortRef.current = countAbort
    setPending({ action, formatLabel, scope })
    setLiveCount(null)
    if (scope !== 'all' || !fetchLiveCount) return
    setCounting(true)
    fetchLiveCount(countAbort.signal)
      .then((count) => {
        if (countRequestRef.current === requestId) setLiveCount(count)
      })
      .catch(() => {
        // Fall back to the dropdown's known count below.
        if (countRequestRef.current === requestId) setLiveCount(null)
      })
      .finally(() => {
        if (countRequestRef.current === requestId) setCounting(false)
      })
  }

  // Close the preview and drop the in-flight count request — the dialog is
  // gone, so its response is no longer needed.
  const closePreview = () => {
    countRequestRef.current += 1 // invalidate any in-flight response
    countAbortRef.current?.abort()
    countAbortRef.current = null
    setPending(null)
    setCounting(false)
  }

  const confirmExport = () => {
    if (!pending) return
    onSelect(pending.action, pending.scope)
    closePreview()
  }

  const allCountLabel =
    totalCount != null
      ? `${totalCount} ${recordWord(totalCount)}`
      : 'all records'

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={job !== null}
          className="h-8 rounded-lg text-xs text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-60"
        >
          {job !== null ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {job !== null ? 'Exporting…' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Export records</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <GroupHeader>This page ({pageCount})</GroupHeader>
          <DropdownMenuItem onSelect={() => openPreview('pdf', 'page')}>
            <FileText />
            PDF · {pageCount} {recordWord(pageCount)}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openPreview('excel', 'page')}>
            <FileSpreadsheet />
            Excel · {pageCount} {recordWord(pageCount)}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <GroupHeader>All records (filtered)</GroupHeader>
          <DropdownMenuItem onSelect={() => openPreview('pdf', 'all')}>
            <FileText />
            PDF · {allCountLabel}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openPreview('excel', 'all')}>
            <FileSpreadsheet />
            Excel · {allCountLabel}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {extraGroups?.map((group) => (
          <DropdownMenuGroup key={group.label}>
            <DropdownMenuSeparator />
            <GroupHeader>{group.label}</GroupHeader>
            {group.items.map((item) => (
              <DropdownMenuItem
                key={item.action}
                onSelect={() => openPreview(item.action, 'all')}
              >
                {item.action.startsWith('excel') ? (
                  <FileSpreadsheet />
                ) : (
                  <FileText />
                )}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
      {/* Count preview before starting a large export */}
      {pending && (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) closePreview()
          }}
          title={
            pending.scope === 'all'
              ? 'Export all matching records?'
              : 'Export this page?'
          }
          desc={
            <div className="space-y-2">
              {pending.scope === 'all' ? (
                <p>
                  This will export{' '}
                  <strong className="text-foreground">
                    {liveCount != null
                      ? `${liveCount} ${recordWord(liveCount)}`
                      : allCountLabel}
                  </strong>{' '}
                  matching your current filters as {pending.formatLabel}.
                </p>
              ) : (
                <p>
                  This will export{' '}
                  <strong className="text-foreground">
                    {pageCount} {recordWord(pageCount)}
                  </strong>{' '}
                  from the current page as {pending.formatLabel}.
                </p>
              )}
              {counting && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Refreshing the live count…
                </p>
              )}
              <p className="text-xs">
                Large exports can be cancelled or moved to the background after
                they start, so you can keep working while the file is prepared.
              </p>
            </div>
          }
          confirmText="Export"
          cancelBtnText="Cancel"
          // The count refreshes in the background and the export re-fetches
          // everything anyway, so the user can confirm immediately.
          handleConfirm={confirmExport}
        />
      )}
    </DropdownMenu>
  )
}

interface ExportOverlayProps {
  job: ExportJob
  eta: number | null
  progress: number
  onBackground: () => void
  onCancel: () => void
}

/**
 * Blocking export overlay with live ETA + progress bar, a "Cancel" button
 * that stops the job at any point, and a "Background" button that dismisses
 * it and continues via a progress toast.
 */
export function ExportOverlay({
  job,
  eta,
  progress,
  onBackground,
  onCancel,
}: ExportOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
      <div className="flex w-[340px] items-start gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-lg">
        <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {job.cancelling
              ? 'Cancelling…'
              : job.phase === 'fetch'
                ? 'Fetching records…'
                : 'Generating file…'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {job.cancelling
              ? 'Stopping the export…'
              : job.phase === 'fetch'
                ? `${job.fetched}/${job.total ?? '…'} records`
                : `${job.totalRows ?? ''} record${(job.totalRows ?? 1) !== 1 ? 's' : ''}`}
            {!job.cancelling && eta !== null
              ? ` · ${formatEta(eta)} remaining`
              : ''}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
            {job.cancelling
              ? 'This operation can be cancelled at any point — finishing up…'
              : 'You can cancel this operation at any point, or keep working by moving it to the background.'}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-xs"
            disabled={job.cancelling}
            onClick={onBackground}
          >
            Background
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={job.cancelling}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
