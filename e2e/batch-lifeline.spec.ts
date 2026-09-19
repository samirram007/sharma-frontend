import { expect, test } from '@playwright/test'
import { expectNoErrorState, loginAsAdmin } from './helpers/auth'

/**
 * Batch Lifeline — the unbounded history of one batch number.
 *
 * The live data shares batch numbers across items and godowns (that is exactly
 * why the lifeline is keyed by batch no), so the bucket picker has to show up
 * for the fixture batch.
 */

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page)
})

test('the lifeline page lists a batch number whole history with year markers', async ({
  page,
}) => {
  await page.goto('/reports/batch_lifeline')
  await expectNoErrorState(page)

  await expect(
    page.getByRole('heading', { name: 'Batch Lifeline' }),
  ).toBeVisible()
  await expect(page.getByText('Pick a batch number')).toBeVisible()

  await page.getByLabel('Batch number').fill('01-04-2026')
  await page.getByRole('button', { name: 'Load lifeline' }).click()

  // Summary + timeline.
  await expect(page.getByText('Lines on the timeline')).toBeVisible({
    timeout: 20_000,
  })
  await expect(page.getByText('Balance today')).toBeVisible()
  await expect(page.getByText('Item / godown bucket(s)')).toBeVisible()

  const lines = page.locator('tbody tr')
  await expect(lines.first()).toBeVisible()
  const allBuckets = await lines.count()
  expect(allBuckets).toBeGreaterThan(1)

  // The fiscal year is marked inline, with that year's opening/in/out/close.
  await expect(page.getByText(/Fiscal Year|^FY /).first()).toBeVisible()

  // A shared batch number exposes the item+godown bucket picker, and pinning a
  // bucket narrows the timeline.
  const bucket = page.getByLabel('Bucket')
  await expect(bucket).toBeVisible()
  await bucket.click()
  await page.getByRole('option').nth(1).click()
  await expect(page.getByText('Whole batch number')).toHaveCount(0)
  await expect.poll(async () => lines.count()).toBeLessThan(allBuckets)

  // Whole batch number again.
  await bucket.click()
  await page.getByRole('option', { name: 'All items and godowns' }).click()
  await expect(page.getByText('Whole batch number')).toBeVisible()
})

test('the batch inspector opens the same history as a Lifeline tab', async ({
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
  await page.getByRole('option', { name: 'Grid (table)' }).click()
  await page.locator('tbody tr').first().click()

  const lifelineTab = page.getByRole('tab', { name: 'Lifeline' })
  await expect(lifelineTab).toBeVisible()
  await lifelineTab.click()

  // Either the history loaded, or the batch number truly has no other lines.
  await expect(
    page.getByText(
      /Closing balance on this page:|No earlier lines recorded against/,
    ),
  ).toBeVisible({ timeout: 20_000 })
})
