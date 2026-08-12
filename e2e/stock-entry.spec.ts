import { expect, type Locator, type Page, test } from '@playwright/test'
import { expectNoErrorState, loginAsAdmin } from './helpers/auth'

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
 * The voucher-entry grid's buttons are NOT exposed in the accessibility tree
 * in headless Chromium (getByRole sees the shell's buttons only), so grid
 * interactions use CSS + text matching — the same approach the legacy CDP
 * probes used.
 */
function buttonByText(page: Page, text: string): Locator {
  return page.locator('button', { hasText: text }).first()
}

/**
 * Boots the SPA at the dashboard first so the auth context and permissions are
 * fully restored before navigating to the (permission-gated) target page.
 * Navigating directly to a heavy entry page races the auth restore, which can
 * leave the routed content unrendered.
 */
async function gotoAuthenticated(page: Page, path: string): Promise<void> {
  await page.goto('/')
  // The sidebar menu button is the earliest reliable signal that the app shell
  // (and therefore the restored auth context) is ready.
  await expect(
    page
      .locator('a[data-sidebar="menu-button"]', { hasText: 'Dashboard' })
      .first(),
  ).toBeVisible({ timeout: 30_000 })
  await page.goto(path)
}

/**
 * Ensures at least one entry row exists. The entry grid auto-appends the first
 * row on mount, but that effect waits on the movement type resolving and is
 * racy in headless — so fall back to the always-present "+ Add Item" button.
 * Returns the row's "Select item" button.
 */
async function ensureFirstRow(page: Page): Promise<Locator> {
  const addItem = buttonByText(page, 'Add Item')
  const selectItem = buttonByText(page, 'Select item')

  await expect(addItem.or(selectItem).first()).toBeVisible({ timeout: 30_000 })

  if (!(await selectItem.isVisible().catch(() => false))) {
    await addItem.click()
  }
  await expect(selectItem).toBeVisible({ timeout: 15_000 })
  return selectItem
}

/**
 * Picks the first result from a cmdk command sheet (used by the item / godown /
 * batch pickers). Optionally types a search query first. The "Finish" footer
 * item is always skipped.
 */
async function pickFromCombo(
  page: Page,
  placeholder: string,
  query?: string,
): Promise<string> {
  const search = page.locator(`input[placeholder="${placeholder}"]`)
  await expect(search).toBeVisible({ timeout: 15_000 })

  if (query) {
    await search.fill(query)
    await page.waitForTimeout(500) // cmdk filters as you type
  }

  const result = page
    .locator('[cmdk-item]')
    .filter({ hasNotText: /Finish/ })
    .first()
  await expect(result).toBeVisible({ timeout: 15_000 })
  const label = (await result.textContent())?.trim() ?? ''
  await result.click()
  return label
}

test.describe('Stock entry — opening stock', () => {
  // Only ONE opening stock voucher is allowed per fiscal year (enforced by the
  // backend AND the frontend lock). With an OPNSK voucher already seeded for
  // the admin's fiscal year, the /opening_stock index redirects to the
  // existing voucher's edit screen instead of a blank create grid — so the
  // grid is exercised through the EDIT flow (the same loading path the
  // list-mode stockJournalEntries + fiscalYearId regressions broke).
  test('existing voucher redirects and loads with its godown rows', async ({
    page,
  }) => {
    const getPageErrors = trackPageErrors(page)

    await gotoAuthenticated(page, '/transactions/vouchers/opening_stock')
    // The index route must redirect to the existing voucher's detail route
    await page.waitForURL(/opening_stock\/\d+/, { timeout: 30_000 })

    // The loaded grid renders godown sub-rows — batch is a free-text field
    // for IN rows (opening stock)
    await expect(page.locator('input[name="batchNo"]').first()).toBeVisible({
      timeout: 30_000,
    })
    const batchCount = await page.locator('input[name="batchNo"]').count()
    expect(batchCount).toBeGreaterThan(0)

    // The pinned summary bar shows the loaded stock journal entry count
    const totalsText = await page
      .locator('div', { hasText: /item\(s\)/ })
      .first()
      .textContent()
    const itemCount = Number(totalsText?.match(/(\d+) item\(s\)/)?.[1] ?? 0)
    expect(itemCount).toBeGreaterThan(0)

    // The first item combobox still opens its picker sheet in edit mode
    await page.locator('button[role="combobox"]').first().click()
    await expect(
      page.locator('input[placeholder="Search item..."]'),
    ).toBeVisible({ timeout: 15_000 })
    await page.keyboard.press('Escape')

    // The loaded grid is editable (admin in edit mode) — the first godown
    // row's free-text batch input accepts input and keeps it
    const firstBatch = page.locator('input[name="batchNo"]').first()
    await firstBatch.fill('E2E-EDIT-1')
    await expect(firstBatch).toHaveValue('E2E-EDIT-1')

    await expectNoErrorState(page)
    expect(getPageErrors()).toEqual([])
  })
})

test.describe('Stock entry — conversion journal', () => {
  test('batch can be set via the picker or free text', async ({ page }) => {
    const getPageErrors = trackPageErrors(page)

    await gotoAuthenticated(
      page,
      '/transactions/vouchers/conversion_journal/new',
    )
    const selectItem = await ensureFirstRow(page)

    await selectItem.click()
    await pickFromCombo(page, 'Search item...', 'ultra')

    await buttonByText(page, 'Select godown').click()
    await pickFromCombo(page, 'Search godown...', 'a')

    // OUT rows show the batch picker; if the movement-type auto-append race
    // rendered the IN layout instead, a free-text batch input appears. Either
    // way a batch can be entered — cover both.
    const batchPicker = buttonByText(page, 'Select batch')
    const batchText = page.locator('input[name="batchNo"]').first()

    if (await batchPicker.isVisible().catch(() => false)) {
      await batchPicker.click()

      // The batch search is autofocused
      const batchSearch: Locator = page.locator(
        'input[placeholder="Search batch..."]',
      )
      await expect(batchSearch).toBeVisible({ timeout: 15_000 })
      await expect(batchSearch).toBeFocused()

      // Navigate with the keyboard and confirm an item is selected
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      const selected = page
        .locator(
          '[cmdk-item][data-selected="true"], [cmdk-item][aria-selected="true"]',
        )
        .first()
      await expect(selected).toBeVisible({ timeout: 15_000 })

      await page.keyboard.press('Enter')
      await expect(batchPicker).toHaveCount(0, { timeout: 15_000 }) // sheet closed
    } else {
      await expect(batchText).toBeVisible({ timeout: 15_000 })
      await batchText.fill('E2E-BATCH-1')
    }

    // The row is populated — its rate field is present
    await expect(page.locator('#rate-0')).toBeVisible({ timeout: 15_000 })

    await expectNoErrorState(page)
    expect(getPageErrors()).toEqual([])
  })
})
