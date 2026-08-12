import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export type ExportFormat = 'pdf' | 'excel'
export type ExportScope = 'page' | 'all'

export interface ExportJob {
  /** Export action id — 'pdf' | 'excel' by default; grids with multiple
   *  formats use ids like 'pdf-summary', 'excel-flat', … */
  action: string
  format: ExportFormat
  scope: ExportScope
  background: boolean
  phase: 'fetch' | 'generate'
  fetched: number
  total: number | null
  totalRows: number | null
  startedAt: number
  /** True after the user asks to cancel — the job keeps this state until the
   *  in-flight work drains, so the UI can show "Cancelling…" and new exports
   *  stay blocked until the previous one has fully stopped. */
  cancelling?: boolean
}

/** Human-readable ETA, e.g. "~42s" or "~2m 10s". */
export function formatEta(seconds: number): string {
  if (seconds < 1) return '<1s'
  if (seconds < 60) return `~${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `~${m}m ${s}s`
}

/**
 * Estimate remaining seconds for an in-flight export.
 * - Fetch phase: derived from real progress (fetched/total) vs elapsed time.
 * - Generate phase: heuristic per record (Excel is heavier than PDF).
 */
export function computeEta(job: ExportJob, nowMs: number): number | null {
  const elapsed = (nowMs - job.startedAt) / 1000
  if (job.phase === 'fetch' && job.total && job.fetched > 0) {
    const frac = Math.min(job.fetched / job.total, 1)
    if (frac >= 1) return null
    // Clamp so the very first (tiny) progress sample doesn't promise a
    // minutes-long estimate.
    return Math.min((elapsed / frac) * (1 - frac), 600)
  }
  if (job.phase === 'generate' && job.totalRows) {
    const perRow = job.format === 'excel' ? 0.0025 : 0.001
    return Math.max(2, job.totalRows * perRow)
  }
  return null
}

/** Rough completion % for the progress bar (fetch is 0–90%, generate ~95%). */
export function exportProgressPercent(job: ExportJob): number {
  if (job.phase === 'fetch') {
    if (!job.total) return 5
    return Math.min(Math.round((job.fetched / job.total) * 90), 90)
  }
  return 95
}

export interface UseExportJobOptions<TRow> {
  /** Rows for the 'page' scope (the currently rendered page). */
  getPageRows: () => Array<TRow>
  /** Rows for the 'all' scope when everything is already client-side. */
  getFilteredRows?: () => Array<TRow>
  /** Server-paginated fallback for 'all' — overrides getFilteredRows when set.
   *  Reports progress (fetched, total) so the fetch phase stays live. The
   *  signal aborts when the user cancels the export; loops should check
   *  `signal.aborted` and stop early. */
  fetchAll?: (
    onProgress: (fetched: number, total: number | null) => void,
    signal: AbortSignal,
  ) => Promise<Array<TRow>>
  /** Generates the file for the given action + rows (PDF/Excel builders).
   *  Receives the abort signal so implementations can skip the final
   *  download when the user cancelled mid-generation. */
  generate: (
    action: string,
    rows: Array<TRow>,
    signal?: AbortSignal,
  ) => Promise<void> | void
  /** Noun used in the success toast, e.g. 'record' (default). */
  successLabel?: string
}

export interface ExportJobController {
  exportJob: ExportJob | null
  eta: number | null
  progress: number
  runExport: (action: string, scope: ExportScope) => void
  handleRunInBackground: () => void
  /** Stops the current export. The fetch loop stops at the next opportunity
   *  and no success/error feedback is shown for the cancelled job. */
  cancelExport: () => void
}

/**
 * Manages a single-flight export with a live ETA + progress bar, an optional
 * "move to background" flow (sonner toast keeps updating while the grid stays
 * usable), and success/error feedback. Shared by all freight grids so the
 * export UX is identical everywhere.
 */
export function useExportJob<TRow>(
  options: UseExportJobOptions<TRow>,
): ExportJobController {
  const [exportJob, setExportJob] = useState<ExportJob | null>(null)
  const [now, setNow] = useState(() => Date.now())

  // Read the latest options on every invocation so runExport never closes
  // over stale rows/params, while keeping a stable identity.
  const optionsRef = useRef(options)
  optionsRef.current = options

  const inFlightRef = useRef(false)
  // Aborted when the user cancels the export — lets the in-flight fetch loop
  // stop early and prevents the drained work from resurrecting the progress UI.
  const abortRef = useRef<AbortController | null>(null)
  const exportToastRef = useRef<string | number | null>(null)
  // Live mirror of exportJob for handlers that must stay pure (no side
  // effects inside state updaters — those run twice in StrictMode).
  const exportJobRef = useRef<ExportJob | null>(null)

  useEffect(() => {
    exportJobRef.current = exportJob
  }, [exportJob])

  const runExport = useCallback(async (action: string, scope: ExportScope) => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    // Refresh the ETA clock so the first estimate isn't based on a stale
    // timestamp from before the job started.
    setNow(Date.now())

    // A fresh controller per job; cancelling it makes fetchAll stop early and
    // suppresses the success toast once the drained work settles.
    const abort = new AbortController()
    abortRef.current = abort
    const { signal } = abort

    const { getPageRows, getFilteredRows, fetchAll, generate, successLabel } =
      optionsRef.current
    const format: ExportFormat = action.startsWith('excel') ? 'excel' : 'pdf'
    const startedAt = Date.now()

    const updateProgress = (
      phase: 'fetch' | 'generate',
      fetched: number,
      total: number | null,
      totalRows: number,
    ) => {
      // A cancelled job must never resurrect its overlay/toast — the user
      // asked to stop, so drop any progress tick that arrives afterwards.
      if (signal.aborted) return
      // Preserve the current job's background flag and start time so a
      // progress tick never resurrects the blocking overlay after the user
      // moved the export to the background.
      setExportJob((job) => ({
        action,
        format,
        scope,
        background: job?.background ?? false,
        phase,
        fetched,
        total,
        totalRows,
        startedAt: job?.startedAt ?? startedAt,
      }))
    }

    try {
      let rows: Array<TRow>
      if (scope === 'page') {
        rows = getPageRows()
      } else if (fetchAll) {
        // Surface the blocking overlay immediately — the first page fetch can
        // take a moment, and the user shouldn't stare at nothing after
        // confirming the export. Real progress ticks refine it as pages land.
        updateProgress('fetch', 0, null, 0)
        rows = await fetchAll(
          (fetched, total) => updateProgress('fetch', fetched, total, fetched),
          signal,
        )
      } else {
        rows = getFilteredRows ? getFilteredRows() : getPageRows()
      }

      // Cancelled while fetching — bail before any success/empty toasts.
      if (signal.aborted) return

      if (rows.length === 0) {
        if (exportToastRef.current) {
          toast.warning('No records to export.', {
            id: exportToastRef.current,
          })
        } else {
          toast.warning('No records to export.')
        }
        return
      }

      updateProgress('generate', rows.length, rows.length, rows.length)
      await generate(action, rows, signal)

      // Cancelled while the file was being built — the download may already
      // have started, but don't celebrate a job the user stopped.
      if (signal.aborted) return

      const noun = successLabel ?? 'record'
      const message = `${rows.length} ${noun}${rows.length !== 1 ? 's' : ''} exported`
      if (exportToastRef.current) {
        toast.success(`${message} — download started`, {
          id: exportToastRef.current,
        })
      } else {
        toast.success(message)
      }
    } catch (error) {
      // Cancellation is intentional — not an error worth reporting.
      if (signal.aborted) return
      console.error('Export failed:', error)
      if (exportToastRef.current) {
        toast.error('Export failed. Please try again.', {
          id: exportToastRef.current,
        })
      } else {
        toast.error('Export failed. Please try again.')
      }
    } finally {
      inFlightRef.current = false
      exportToastRef.current = null
      abortRef.current = null
      setExportJob(null)
    }
  }, [])

  // While an export runs, tick `now` every 500ms so the ETA stays live. In
  // background mode the same tick refreshes the progress toast.
  useEffect(() => {
    if (!exportJob) return
    const interval = window.setInterval(() => {
      const tick = Date.now()
      setNow(tick)
      if (exportJob.background && exportToastRef.current) {
        const eta = computeEta(exportJob, tick)
        const label = exportJob.format === 'excel' ? 'Excel' : 'PDF'
        toast.loading(
          exportJob.phase === 'fetch'
            ? `Fetching records… ${exportJob.fetched}/${exportJob.total ?? '…'}`
            : `Generating ${label}…`,
          {
            id: exportToastRef.current,
            description:
              eta !== null ? `${formatEta(eta)} remaining` : 'Working…',
            // Progress updates must keep re-attaching the action, otherwise
            // sonner drops it on the next 500ms tick.
            action: { label: 'Cancel', onClick: () => cancelExport() },
          },
        )
      }
    }, 500)
    return () => window.clearInterval(interval)
  }, [exportJob])

  // Stop the current job. The in-flight fetch loop checks `signal.aborted` and
  // stops at the next opportunity; the drained work settles silently (progress
  // ticks and the success toast both bail on an aborted signal). The job is
  // marked `cancelling` rather than dropped so the overlay/buttons stay in a
  // clear stopped state and new exports stay blocked until the old job drains.
  const cancelExport = useCallback(() => {
    const abort = abortRef.current
    if (!abort || abort.signal.aborted) return
    abort.abort()
    // Dismiss any live progress toast and confirm the cancellation.
    if (exportToastRef.current) {
      toast.dismiss(exportToastRef.current)
      exportToastRef.current = null
    }
    toast.info('Export cancelled.')
    setExportJob((prev) => (prev ? { ...prev, cancelling: true } : prev))
  }, [])

  // Dismiss the blocking overlay and continue the job via a live progress
  // toast with a persistent Cancel action, freeing the page for other work.
  // Side effects are kept out of the state updater (updaters can run twice
  // in StrictMode).
  const handleRunInBackground = useCallback(() => {
    const job = exportJobRef.current
    if (!job || job.background) return
    const label = job.format === 'excel' ? 'Excel' : 'PDF'
    const toastId = toast.loading(
      job.phase === 'fetch'
        ? `Fetching records… ${job.fetched}/${job.total ?? '…'}`
        : `Generating ${label}…`,
      {
        action: { label: 'Cancel', onClick: () => cancelExport() },
      },
    )
    exportToastRef.current = toastId
    setExportJob((prev) => (prev ? { ...prev, background: true } : prev))
  }, [cancelExport])

  return {
    exportJob,
    eta: exportJob ? computeEta(exportJob, now) : null,
    progress: exportJob ? exportProgressPercent(exportJob) : 0,
    runExport,
    handleRunInBackground,
    cancelExport,
  }
}
