import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { expectNoErrorState, loginAsAdmin } from './helpers/auth'

/**
 * Batch Balancing report.
 *
 * The report pages batches server-side (the first page is a slice of every
 * match), which is why the carry-forward assertion drives the integrity filter
 * instead of relying on a particular batch landing on page 1.
 */

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page)
})

/** Open the "More filters" drawer and pick a value in one of its selects. */
async function chooseAdvancedFilter(
  page: Page,
  triggerLabel: string,
  optionLabel: string,
) {
  const moreFilters = page.getByRole('button', { name: /More filters/ })
  if ((await moreFilters.getAttribute('aria-expanded')) !== 'true') {
    await moreFilters.click()
  }
  await page.getByLabel(triggerLabel).click()
  await page.getByRole('option', { name: optionLabel }).click()
}

test('carry-forward batches carry the amber no-opening-voucher badge', async ({
  page,
}) => {
  await page.goto('/reports/batch_balancing')
  await expectNoErrorState(page)

  await page
    .getByPlaceholder('Search batch no / item')
    .fill('ULTRATECH PREMIUM')
  await chooseAdvancedFilter(page, 'Integrity filter', 'No opening voucher')
  await page.getByRole('button', { name: 'Apply' }).click()

  // Wait for the result summary, then for the batch cards.
  await expect(page.getByText('Batches (all matches)')).toBeVisible({
    timeout: 20_000,
  })
  await expect(page.getByText('Item:').first()).toBeVisible({ timeout: 20_000 })

  const cards = page.getByRole('button', { name: /Item:/ })
  const cardCount = await cards.count()
  expect(cardCount).toBeGreaterThan(0)

  // Every batch the carry-forward filter returns must carry the badge.
  const badge = page.getByText('No opening voucher — carried from history')
  await expect.poll(async () => badge.count()).toBe(cardCount)
  await expect(badge.first()).toContainText('carried from history')

  // The reconciliation tile reflects (and toggles) the same filter.
  const carryTile = page.getByRole('button', {
    name: 'Filter by No opening voucher',
  })
  await expect(carryTile).toHaveAttribute('aria-pressed', 'true')

  // Expand the first card so the badge + opening row are captured together.
  await badge.first().click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'test-results/badge-card.png', fullPage: false })

  // Toggling the tile off widens the result set again (no error state).
  await carryTile.click()
  await expect(carryTile).toHaveAttribute('aria-pressed', 'false')
  await expectNoErrorState(page)
})

test('grid view opens the inspector with trail, valuation and ageing', async ({
  page,
}) => {
  await page.goto('/reports/batch_balancing')
  await expectNoErrorState(page)

  await page.getByPlaceholder('Search batch no / item').fill('ULTRATECH')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByText('Batches (all matches)')).toBeVisible({
    timeout: 20_000,
  })

  // Grid view — the dense table of the page's batches.
  await page.getByLabel('Report view').click()
  await page.getByRole('option', { name: 'Grid (table)' }).click()
  await expect(page.getByText(/batches? on this page/)).toBeVisible()

  const rows = page.locator('tbody tr')
  expect(await rows.count()).toBeGreaterThan(0)

  // Inspecting a row opens the side panel with the batch's full detail.
  await rows.first().click()
  await expect(page.getByRole('tab', { name: 'Trail' })).toBeVisible()
  await page.getByRole('tab', { name: 'Valuation' }).click()
  await expect(page.getByText(/Closing value = opening/)).toBeVisible()
  await page.getByRole('tab', { name: /Reconciliation/ }).click()
  await expect(
    page.getByRole('tabpanel').getByText(/^Ageing/).first(),
  ).toBeVisible()
})

test('ranked, pivot and ageing views render the new inspection layouts', async ({
  page,
}) => {
  await page.goto('/reports/batch_balancing')
  await expectNoErrorState(page)

  // The advanced drawer keeps the integrity/voucher filters but no longer
  // offers an expiry filter or a window date range.
  const moreFilters = page.getByRole('button', { name: /More filters/ })
  if ((await moreFilters.getAttribute('aria-expanded')) !== 'true') {
    await moreFilters.click()
  }
  await expect(page.getByLabel('Expiry filter')).toHaveCount(0)
  await expect(page.getByLabel('Window from date')).toHaveCount(0)
  await expect(page.getByLabel('Expiring within days')).toHaveCount(0)

  await page.getByPlaceholder('Search batch no / item').fill('ULTRATECH')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByText('Batches (all matches)')).toBeVisible({
    timeout: 20_000,
  })

  // Ranked leaderboard — ranks this page by closing value with shares.
  await page.getByLabel('Report view').click()
  await page.getByRole('option', { name: 'Ranked (top batches)' }).click()
  await expect(page.getByLabel('Rank by')).toBeVisible()
  await expect(page.getByText(/ranked by closing value/).first()).toBeVisible()
  expect(await page.locator('tbody tr').count()).toBeGreaterThan(0)

  // Pivot — item × godown matrix with a value-only total line.
  await page.getByLabel('Report view').click()
  await page.getByRole('option', { name: 'Item × godown pivot' }).click()
  await expect(page.getByRole('rowheader').first()).toBeVisible()
  // The footer row totals the godown columns (scoped — the godown filter
  // select carries the same "All godowns" label).
  await expect(
    page.getByRole('rowheader', { name: 'All godowns' }),
  ).toBeVisible()

  // Ageing-wise stays a grouped view of manufacturing-age bands.
  await page.getByLabel('Report view').click()
  await page.getByRole('option', { name: 'Ageing-wise' }).click()
  await expect(page.getByText(/Manufacturing age/).first()).toBeVisible()
})

test('voucher-type-wise view lists each batch with its batch no and godown', async ({
  page,
}) => {
  await page.goto('/reports/batch_balancing')
  await expectNoErrorState(page)

  await page.getByPlaceholder('Search batch no / item').fill('ULTRATECH')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByText('Batches (all matches)')).toBeVisible({
    timeout: 20_000,
  })

  await page.getByLabel('Report view').click()
  await page.getByRole('option', { name: 'Voucher-type-wise' }).click()

  // One block per voucher type, each a table of the batches behind it — the
  // batch no and godown are columns, not just a card header.
  await expect(
    page.getByText(/each row is one batch's lines/),
  ).toBeVisible({ timeout: 20_000 })
  await expect(
    page.getByRole('columnheader', { name: 'Batch no' }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole('columnheader', { name: 'Godown' }).first(),
  ).toBeVisible()

  const rows = page.locator('tbody tr')
  expect(await rows.count()).toBeGreaterThan(0)

  // Every row is identified by its batch no and godown (the first two cells).
  const cells = rows.first().locator('td')
  expect((await cells.nth(0).innerText()).trim().length).toBeGreaterThan(0)
  expect((await cells.nth(1).innerText()).trim().length).toBeGreaterThan(0)

  // A row still opens the batch's movement trail in the inspector, which
  // repeats the same two columns on every trail row.
  await rows.first().click()
  await expect(page.getByRole('tab', { name: 'Trail' })).toBeVisible()
  await expect(
    page.getByRole('tabpanel').getByRole('columnheader', { name: 'Batch no' }),
  ).toBeVisible({ timeout: 20_000 })
  await expect(
    page.getByRole('tabpanel').getByRole('columnheader', { name: 'Godown' }),
  ).toBeVisible()
  await expect(
    page.getByRole('tabpanel').getByText('Closing balance'),
  ).toBeVisible({ timeout: 20_000 })

  await expectNoErrorState(page)
})

test('filters can be saved as a preset and re-applied after a reload', async ({
  page,
}) => {
  await page.goto('/reports/batch_balancing')
  await expectNoErrorState(page)

  // In-stock-only lives in the advanced drawer and is preset-worthy on its own.
  const moreFilters = page.getByRole('button', { name: /More filters/ })
  if ((await moreFilters.getAttribute('aria-expanded')) !== 'true') {
    await moreFilters.click()
  }
  await page.getByLabel('Only batches with stock').click()
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByText('Batches (all matches)')).toBeVisible({
    timeout: 20_000,
  })

  await page.getByRole('button', { name: /Presets/ }).click()
  await page.getByPlaceholder('Preset name').fill('In stock')
  await page.getByTitle('Save current filters as a preset').click()
  await page.keyboard.press('Escape')

  // A fresh load starts unfiltered; the preset restores the query.
  await page.reload()
  await expect(page.getByText('Set at least one filter')).toBeVisible()

  await page.getByRole('button', { name: /Presets/ }).click()
  await page.getByRole('menuitem', { name: /In stock/ }).click()
  await expect(page.getByText('Batches (all matches)')).toBeVisible({
    timeout: 20_000,
  })
  await expectNoErrorState(page)
})
