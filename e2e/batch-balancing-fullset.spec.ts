import { expect, test } from '@playwright/test'
import { expectNoErrorState, loginAsAdmin } from './helpers/auth'

/**
 * Ranked and pivot are whole-result-set views: they must read every matching
 * batch, not the page the report happened to load. The ULTRATECH search matches
 * hundreds of batches in the live data, so the default 100-per-page report
 * proves the difference.
 */

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page)
})

test('ranked and pivot cover every matching batch, not just the loaded page', async ({
  page,
}) => {
  await page.goto('/reports/batch_balancing')
  await expectNoErrorState(page)

  await page.getByPlaceholder('Search batch no / item').fill('ULTRATECH')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByText('Batches (all matches)')).toBeVisible({
    timeout: 20_000,
  })

  // The paged report only holds a page of the matches.
  const pager = page.getByText(/Batches 1–\d+ of \d+/)
  await expect(pager).toBeVisible({ timeout: 20_000 })
  const total = Number((await pager.innerText()).split(' of ')[1])
  expect(total).toBeGreaterThan(100)

  // ── Ranked ─────────────────────────────────────────────────────────────
  await page.getByLabel('Report view').click()
  await page.getByRole('option', { name: 'Ranked (top batches)' }).click()

  await expect(page.getByText(/reads/)).toBeVisible()
  await expect(
    page.getByText(new RegExp(`reads\\s+all ${total} matching batch\\(es\\)`)),
  ).toBeVisible({ timeout: 20_000 })

  const rankedHeader = await page
    .getByText(/batches ranked\s+by closing value/)
    .first()
    .innerText()
  expect(Number(rankedHeader.match(/^(\d+)/)?.[1])).toBe(total)

  // Every match is ranked; the table paints a capped slice for the browser.
  const rankedRows = await page.locator('tbody tr').count()
  expect(rankedRows).toBeGreaterThan(100)
  await expect(
    page.getByText(new RegExp(`Showing the top \\d+ of ${total} ranked`)),
  ).toBeVisible()

  // Paging controls have no meaning once the whole set is loaded.
  await expect(page.getByText(/Page \d+ of \d+/)).toHaveCount(0)

  // Opening a ranked row still gets the movement trail, fetched on demand.
  await page.locator('tbody tr').first().click()
  await expect(page.getByRole('tab', { name: 'Trail' })).toBeVisible()
  await expect(page.getByRole('tabpanel').getByText('Closing balance')).toBeVisible(
    { timeout: 20_000 },
  )
  await page.keyboard.press('Escape')

  // ── Pivot ──────────────────────────────────────────────────────────────
  await page.getByLabel('Report view').click()
  await page.getByRole('option', { name: 'Item × godown pivot' }).click()

  await expect(
    page.getByText(new RegExp(`reads\\s+all ${total} matching batch\\(es\\)`)),
  ).toBeVisible({ timeout: 20_000 })

  const pivotHeader = await page
    .getByText(/items\s+×\s+\d+ godown/)
    .first()
    .innerText()
  expect(pivotHeader).toContain(`${total} batches`)
  await expect(
    page.getByRole('rowheader', { name: 'All godowns' }),
  ).toBeVisible()

  await expectNoErrorState(page)
})
