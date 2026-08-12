import { expect, type Page, type Route, test } from '@playwright/test'
import { expectNoErrorState, loginAsAdmin } from './helpers/auth'

/**
 * Regression spec for the freight export cancel flows:
 *
 * 1. Cancelling an All-records export mid-fetch truly aborts the in-flight
 *    page request (no waiting for it to drain), dismisses the overlay, and
 *    frees the grid immediately — with no error toast.
 * 2. Moving an export to the background yields a progress toast whose Cancel
 *    action stops the job (sonner used to drop the action on every ETA tick).
 * 3. Cancelling while the file is being built shows the "Cancelling…" state
 *    and skips the final download.
 * 4. Closing the "Export all matching records?" dialog aborts the live-count
 *    preview request instead of letting it run to completion.
 * 5. The blocking overlay appears immediately after confirming an All-records
 *    export — it must NOT wait for the first (slow) page fetch — tracked as a
 *    latency assertion.
 *
 * Requires the seeded backend (see knowledge.md) with at least one freight
 * delivery note so the Export dropdown renders.
 */

const FREIGHT_URL =
  '/transactions/freight?page=1&perPage=10&freightStatus=prepared'

/**
 * Confirm → overlay bound. Generous enough to absorb Playwright click
 * actionability overhead (~100–300ms) on slow CI, yet far below the multiple
 * seconds the overlay takes when it wrongly waits for the first page fetch.
 * Used both as the toBeVisible timeout and the latency assertion so they
 * cannot drift apart.
 */
const OVERLAY_LATENCY_BOUND_MS = 2_000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page)
})

/** Collects uncaught page errors (JS crashes) — these should never happen. */
function trackPageErrors(page: Page): () => string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  return () => errors
}

/**
 * Collects URLs of requests the client aborted (net::ERR_ABORTED) — the
 * fingerprint of an AbortController.teardown rather than a server failure.
 */
function trackAbortedRequests(page: Page): () => string[] {
  const urls: string[] = []
  page.on('requestfailed', (request) => {
    const failure = request.failure()
    if (failure?.errorText.includes('ERR_ABORTED')) {
      urls.push(request.url())
    }
  })
  return () => urls
}

/**
 * Holds a routed request open for `ms` so a test can observe/cancel the job
 * while the request is mid-flight. Note: Playwright's route.continue() on a
 * request the client already aborted succeeds silently, so the abort must be
 * detected via the page's `requestfailed` event (net::ERR_ABORTED), not by
 * catching around continue().
 */
async function continueAfterDelay(route: Route, ms: number): Promise<void> {
  await sleep(ms)
  await route.continue()
}

/**
 * Boots the SPA at the dashboard first so the auth context is fully restored
 * before navigating to the freight grid, then waits for the grid to render
 * (the Export dropdown only appears once records have loaded).
 */
async function gotoFreightGrid(page: Page): Promise<void> {
  await page.goto('/')
  // The sidebar menu button is the earliest reliable signal that the app shell
  // (and therefore the restored auth context) is ready.
  await expect(
    page
      .locator('a[data-sidebar="menu-button"]', { hasText: 'Dashboard' })
      .first(),
  ).toBeVisible({ timeout: 30_000 })
  await page.goto(FREIGHT_URL)
  await expect(
    page.getByRole('button', { name: 'Export', exact: true }),
  ).toBeVisible({ timeout: 30_000 })
}

const exportButton = (page: Page) =>
  page.getByRole('button', { name: 'Export', exact: true })

/**
 * The blocking export overlay's card (unambiguous vs the confirm dialog). The
 * filter text is the fragment shared by BOTH overlay states — running
 * ("…cancel this operation at any point…") and cancelling ("This operation
 * can be cancelled at any point — finishing up…") — so toHaveCount(0) still
 * means the overlay really unmounted, not just that its text changed.
 */
const overlayCard = (page: Page) =>
  page.locator('div.fixed.inset-0').filter({ hasText: 'at any point' })

/**
 * Opens the export dropdown and confirms an "All records (filtered)" export.
 * Menuitem order inside each format prefix is fixed: [This page, All records,
 * Raw rows], so nth(1) is always the All-records item.
 */
async function startAllRecordsExport(
  page: Page,
  format: 'pdf' | 'excel',
): Promise<void> {
  const label = format === 'excel' ? 'Excel' : 'PDF'
  await exportButton(page).click()
  await page
    .getByRole('menuitem', { name: new RegExp(`^${label} · `) })
    .nth(1)
    .click()

  const dialog = page.getByRole('alertdialog')
  await expect(dialog.getByText('Export all matching records?')).toBeVisible()
  await dialog.getByRole('button', { name: 'Export', exact: true }).click()
}

/** No error toasts must surface after an intentional cancel. */
async function expectNoErrorToasts(page: Page): Promise<void> {
  await expect(page.getByText('Export failed. Please try again.')).toHaveCount(
    0,
  )
  await expect(page.getByText('Network or server error occurred.')).toHaveCount(
    0,
  )
  await expectNoErrorState(page)
}

test.describe('Freight export cancel flows', () => {
  test('cancelling an All-records export mid-fetch aborts the request and frees the grid', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    const getPageErrors = trackPageErrors(page)
    const getAborted = trackAbortedRequests(page)

    await gotoFreightGrid(page)

    // Hold each page fetch open briefly so the export is clearly mid-fetch
    // when we cancel.
    let fetchCalls = 0
    await page.route('**/freights/delivery_note*', async (route) => {
      fetchCalls += 1
      await continueAfterDelay(route, 300)
    })

    await startAllRecordsExport(page, 'pdf')

    // The blocking overlay appears immediately and the first page fetch fires.
    await expect(overlayCard(page)).toBeVisible()
    await expect.poll(() => fetchCalls).toBeGreaterThanOrEqual(1)

    const callsAtCancel = fetchCalls
    await overlayCard(page)
      .getByRole('button', { name: 'Cancel', exact: true })
      .click()

    // Cancel feedback: info toast, no error toast, overlay dismissed.
    await expect(
      page.getByText('Export cancelled.', { exact: true }),
    ).toBeVisible()
    await expectNoErrorToasts(page)
    await expect(overlayCard(page)).toHaveCount(0, { timeout: 10_000 })

    // The job drains and the Export button re-enables.
    await expect(exportButton(page)).toBeEnabled({ timeout: 15_000 })

    // The in-flight EXPORT fetch (per_page=500) was truly aborted — not the
    // preview's count request (per_page=1) — and no further pages were
    // fetched after the cancel.
    await page.waitForTimeout(1_500)
    expect(
      getAborted().some(
        (url) =>
          url.includes('/freights/delivery_note') &&
          url.includes('per_page=500'),
      ),
    ).toBe(true)
    expect(fetchCalls - callsAtCancel).toBeLessThanOrEqual(1)

    expect(getPageErrors()).toEqual([])
  })

  test('cancels an All-records export from the background progress toast', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    const getPageErrors = trackPageErrors(page)

    await gotoFreightGrid(page)

    let fetchCalls = 0
    await page.route('**/freights/delivery_note*', async (route) => {
      fetchCalls += 1
      await continueAfterDelay(route, 300)
    })

    await startAllRecordsExport(page, 'excel')

    await expect(overlayCard(page)).toBeVisible()
    await expect.poll(() => fetchCalls).toBeGreaterThanOrEqual(1)

    // Moving to the background dismisses the overlay and hands the job to a
    // live progress toast with a persistent Cancel action.
    await overlayCard(page)
      .getByRole('button', { name: 'Background', exact: true })
      .click()
    await expect(overlayCard(page)).toHaveCount(0)

    const toast = page
      .locator('[data-sonner-toast]')
      .filter({ hasText: /Fetching records…|Generating/ })
    await expect(toast).toBeVisible()
    const toastCancel = toast.getByRole('button', {
      name: 'Cancel',
      exact: true,
    })
    await expect(toastCancel).toBeVisible()

    // The toast's Cancel must stop the job just like the overlay's.
    await toastCancel.click()

    await expect(
      page.getByText('Export cancelled.', { exact: true }),
    ).toBeVisible()
    await expectNoErrorToasts(page)
    await expect(exportButton(page)).toBeEnabled({ timeout: 15_000 })

    expect(getPageErrors()).toEqual([])
  })

  test('cancelling during file generation shows the Cancelling state and stops the job', async ({
    page,
  }) => {
    test.setTimeout(180_000)
    const getPageErrors = trackPageErrors(page)

    await gotoFreightGrid(page)

    // Hold the Excel builder module import open so the job sits in the
    // generate phase long enough to cancel it (otherwise the build finishes
    // within ~100ms of the fetch draining and there is nothing to cancel).
    // NB: the glob matches Vite DEV module URLs (playwright.config.ts pins
    // `pnpm dev`) — a production build would hash the asset and skip the
    // stall, so the generate phase would finish before it can be cancelled.
    await page.route('**/src/utils/export-table-excel*', async (route) => {
      await sleep(8_000)
      await route.continue()
    })

    await startAllRecordsExport(page, 'excel')

    // The fetch phase drains against the real backend, then generate begins
    // while the Excel module is still loading.
    await expect(page.getByText('Generating file…')).toBeVisible({
      timeout: 120_000,
    })

    await overlayCard(page)
      .getByRole('button', { name: 'Cancel', exact: true })
      .click()

    // Cancel feedback appears immediately: the overlay switches to the
    // "Cancelling…" state and the info toast fires (sonner auto-dismisses it
    // after ~4s, so assert it BEFORE waiting out the module stall below).
    await expect(page.getByText('Cancelling…', { exact: true })).toBeVisible()
    await expect(
      page.getByText('Export cancelled.', { exact: true }),
    ).toBeVisible()
    await expectNoErrorToasts(page)

    // Then the stalled module load drains, the final download is skipped
    // (aborted signal) and the overlay unmounts.
    await expect(overlayCard(page)).toHaveCount(0, { timeout: 20_000 })
    await expect(exportButton(page)).toBeEnabled({ timeout: 15_000 })

    expect(getPageErrors()).toEqual([])
  })

  test('aborts the live-count preview request when the confirm dialog closes', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    const getPageErrors = trackPageErrors(page)
    const getAborted = trackAbortedRequests(page)

    await gotoFreightGrid(page)

    // Stall only the live-count request (per_page=1); let everything else
    // (grid load, page fetches) pass through untouched.
    let countRequests = 0
    await page.route('**/freights/delivery_note*', async (route) => {
      if (!route.request().url().includes('per_page=1')) {
        await route.continue()
        return
      }
      countRequests += 1
      await continueAfterDelay(route, 10_000)
    })

    // Open the All-records preview: the dialog shows the cached count while
    // the live-count request is in flight.
    await exportButton(page).click()
    await page
      .getByRole('menuitem', { name: /^PDF · / })
      .nth(1)
      .click()

    const dialog = page.getByRole('alertdialog')
    await expect(dialog.getByText('Export all matching records?')).toBeVisible()
    await expect(dialog.getByText('Refreshing the live count…')).toBeVisible()
    await expect.poll(() => countRequests).toBeGreaterThanOrEqual(1)

    // Closing the dialog must abort the in-flight count request…
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(dialog).toHaveCount(0)

    // …without surfacing an error toast, and the count request was torn down
    // rather than left to drain.
    await expectNoErrorToasts(page)
    await page.waitForTimeout(1_000)
    expect(getAborted().some((url) => url.includes('per_page=1'))).toBe(true)

    // The preview still works afterwards — re-opening against the REAL backend
    // (routes removed) opens the dialog again and closes cleanly.
    await page.unroute('**/freights/delivery_note*')
    await exportButton(page).click()
    await page
      .getByRole('menuitem', { name: /^PDF · / })
      .nth(1)
      .click()
    await expect(
      page.getByRole('alertdialog').getByText('Export all matching records?'),
    ).toBeVisible()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Cancel', exact: true })
      .click()

    expect(getPageErrors()).toEqual([])
  })
})

test.describe('Freight export overlay latency', () => {
  test('the export overlay appears promptly after confirming, without waiting for the first page fetch', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    const getPageErrors = trackPageErrors(page)

    await gotoFreightGrid(page)

    // Hold every delivery_note fetch open. The regression this guards: if the
    // overlay ever waited for the first page fetch to resolve, it would never
    // appear while the fetch is held, and the bounded assertion below would
    // time out and fail.
    let exportFetches = 0
    await page.route('**/freights/delivery_note*', async (route) => {
      if (route.request().url().includes('per_page=500')) exportFetches += 1
      await sleep(30_000)
      await route.continue()
    })

    // Open the All-records preview and confirm it.
    await exportButton(page).click()
    await page
      .getByRole('menuitem', { name: /^PDF · / })
      .nth(1)
      .click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog.getByText('Export all matching records?')).toBeVisible() // Measure confirm → overlay. runExport sets the fetch-phase job state
    // synchronously, so the overlay must surface well within the bound while
    // the first page fetch is still held open. NB: the measured number
    // includes Playwright's click-actionability overhead (~100–300ms), so it
    // reads higher than the app-side latency (~200ms).
    const startedAt = Date.now()
    await dialog.getByRole('button', { name: 'Export', exact: true }).click()
    await expect(overlayCard(page)).toBeVisible({
      timeout: OVERLAY_LATENCY_BOUND_MS,
    })
    const latencyMs = Date.now() - startedAt
    // Surface the measured number in the HTML report.
    test.info().annotations.push({
      type: 'overlay-latency',
      description: `${latencyMs}ms`,
    })
    expect(latencyMs).toBeLessThan(OVERLAY_LATENCY_BOUND_MS)

    // Sanity: the export fetch really is in flight (stalled) when we measured.
    await expect.poll(() => exportFetches).toBeGreaterThanOrEqual(1)

    // Tidy up — cancel so no job lingers.
    await overlayCard(page)
      .getByRole('button', { name: 'Cancel', exact: true })
      .click()
    await expect(
      page.getByText('Export cancelled.', { exact: true }),
    ).toBeVisible()
    await expectNoErrorToasts(page)
    await expect(exportButton(page)).toBeEnabled({ timeout: 15_000 })

    expect(getPageErrors()).toEqual([])
  })
})
