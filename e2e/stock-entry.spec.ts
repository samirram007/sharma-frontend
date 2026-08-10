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
    page.locator('a[data-sidebar="menu-button"]', { hasText: 'Dashboard' }).first()
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
async function pickFromCombo(page: Page, placeholder: string, query?: string): Promise<string> {
  const search = page.locator(`input[placeholder="${placeholder}"]`)
  await expect(search).toBeVisible({ timeout: 15_000 })

  if (query) {
    await search.fill(query)
    await page.waitForTimeout(500) // cmdk filters as you type
  }

  const result = page.locator('[cmdk-item]').filter({ hasNotText: /Finish/ }).first()
  await expect(result).toBeVisible({ timeout: 15_000 })
  const label = (await result.textContent())?.trim() ?? ''
  await result.click()
  return label
}

test.describe('Stock entry — opening stock', () => {
  test('first row is created and both pickers open', async ({ page }) => {
    const getPageErrors = trackPageErrors(page)

    await gotoAuthenticated(page, '/transactions/vouchers/opening_stock/new')
    const selectItem = await ensureFirstRow(page)

    // Item sheet opens with its search input, and picking an item reveals the
    // row's godown selector
    await selectItem.click()
    await expect(page.locator('input[placeholder="Search item..."]')).toBeVisible({ timeout: 15_000 })
    await pickFromCombo(page, 'Search item...')

    const selectGodown = buttonByText(page, 'Select godown')
    await expect(selectGodown).toBeVisible({ timeout: 15_000 })
    await selectGodown.click()
    await expect(page.locator('input[placeholder="Search godown..."]')).toBeVisible({
      timeout: 15_000,
    })
    await page.keyboard.press('Escape')

    // The row now has an amount cell (read-only, auto-computed)
    await expect(page.locator('#amount-0')).toBeVisible({ timeout: 15_000 })

    await expectNoErrorState(page)
    expect(getPageErrors()).toEqual([])
  })

  test('item → godown → batch → qty → rate → amount flow, Enter appends a row', async ({
    page,
  }) => {
    const getPageErrors = trackPageErrors(page)

    await gotoAuthenticated(page, '/transactions/vouchers/opening_stock/new')
    const selectItem = await ensureFirstRow(page)

    // 1. Pick a stock item
    await selectItem.click()
    const itemLabel = await pickFromCombo(page, 'Search item...', 'ultra')
    expect(itemLabel.length).toBeGreaterThan(0)

    // 2. Pick a godown
    await buttonByText(page, 'Select godown').click()
    await pickFromCombo(page, 'Search godown...', 'a')

    // 3. Batch is a free-text field for IN rows (opening stock)
    const batch = page.locator('input[name="batchNo"]').first()
    await expect(batch).toBeVisible({ timeout: 15_000 })
    await batch.fill('E2E-BATCH-1')

    // 4. Quantity
    const qty = page.locator('#qty-0')
    await expect(qty).toBeVisible({ timeout: 15_000 })
    await qty.fill('10')
    await qty.press('Enter')

    // 5. Rate
    const rate = page.locator('#rate-0')
    await expect(rate).toBeVisible({ timeout: 15_000 })
    await rate.fill('50')
    await rate.press('Enter')

    // 6. Amount is auto-computed (10 × 50) and read-only
    const amount = page.locator('#amount-0')
    await expect(amount).toHaveValue(/500/, { timeout: 15_000 })

    // 7. Enter on amount appends a new row
    const rowsBefore = await page.locator('input[id^="amount-"]').count()
    await amount.press('Enter')
    await expect(page.locator('input[id^="amount-"]')).toHaveCount(rowsBefore + 1, {
      timeout: 15_000,
    })
    await expect(page.locator('#qty-1')).toBeVisible({ timeout: 15_000 })

    await expectNoErrorState(page)
    expect(getPageErrors()).toEqual([])
  })
})

test.describe('Stock entry — conversion journal', () => {
  test('batch can be set via the picker or free text', async ({ page }) => {
    const getPageErrors = trackPageErrors(page)

    await gotoAuthenticated(page, '/transactions/vouchers/conversion_journal/new')
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
      const batchSearch: Locator = page.locator('input[placeholder="Search batch..."]')
      await expect(batchSearch).toBeVisible({ timeout: 15_000 })
      await expect(batchSearch).toBeFocused()

      // Navigate with the keyboard and confirm an item is selected
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      const selected = page
        .locator('[cmdk-item][data-selected="true"], [cmdk-item][aria-selected="true"]')
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
