import { expect, test } from '@playwright/test'
import { expectNoErrorState, loginAsAdmin } from './helpers/auth'

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page)
})

test.describe('Key pages', () => {
  test('user-wise dashboard renders', async ({ page }) => {
    await page.goto('/dashboard/user-wise')

    await expect(page.getByRole('heading', { name: 'User-wise Dashboard' })).toBeVisible()
    await expect(page.getByText('Active Users', { exact: true })).toBeVisible()
    await expectNoErrorState(page)
  })

  test('godown masters page renders its data table', async ({ page }) => {
    await page.goto('/masters/inventory/godown')

    // Route uses useSuspenseQuery — wait for the table shell
    await expect(page.getByText('Name', { exact: true })).toBeVisible()
    await expect(page.getByText('Code', { exact: true })).toBeVisible()
    await expectNoErrorState(page)
  })

  test('opening stock entry page opens without a server error', async ({ page }) => {
    await page.goto('/transactions/vouchers/opening_stock/new')

    // The POS form renders a 'Reference No.' field once its heavy data load completes
    await expect(page.getByText('Reference No.', { exact: true })).toBeVisible({
      timeout: 30_000,
    })
    await expectNoErrorState(page)
  })
})
