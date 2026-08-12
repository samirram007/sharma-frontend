import { expect, test } from '@playwright/test'
import { expectNoErrorState, loginAsAdmin } from './helpers/auth'

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page)
})

test.describe('Dashboard', () => {
  test('renders stat cards and charts without a server error', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    // App shell + page header
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Live overview of freight')).toBeVisible()

    // Stat cards (hint text is unique to each card, unlike the sidebar links)
    await expect(page.getByText('registered transporters')).toBeVisible()
    await expect(page.getByText('Freight Bills', { exact: true })).toBeVisible()
    await expect(page.getByText('deliveries dispatched')).toBeVisible()

    // Charts render (recharts wraps each chart in a ResponsiveContainer)
    await expect(
      page.locator('.recharts-responsive-container').first(),
    ).toBeVisible()

    // Regression: no error boundary, no global server-error toast, no widget fallbacks
    await expectNoErrorState(page)
    await expect(page.getByText("Couldn't load this chart.")).toHaveCount(0)
  })

  test('survives a failing widget endpoint (transporter_wise returns 500)', async ({
    page,
  }) => {
    // Simulate the backend regression that previously broke the whole page:
    // /api/dashboard/transporter_wise returns a 500.
    await page.route('**/api/dashboard/transporter_wise*', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'simulated server error' }),
      }),
    )

    await page.goto('/dashboard')

    // The rest of the dashboard stays alive
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Live overview of freight')).toBeVisible()

    // The affected widget shows an inline fallback with a retry action
    // (generous timeout: the query retries once before settling on the error state)
    await expect(page.getByText("Couldn't load this chart.")).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()

    // Other charts still render
    await expect(
      page.locator('.recharts-responsive-container').first(),
    ).toBeVisible()

    // Regression: no full-page error boundary and no global 'Internal Server Error!' toast
    await expectNoErrorState(page)
  })

  test('recovers when a failing widget is retried', async ({ page }) => {
    let shouldFail = true

    await page.route('**/api/dashboard/transporter_wise*', async (route) => {
      if (shouldFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'simulated server error' }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/dashboard')

    // Wait until the mocked endpoint actually returned its 500, then expect the
    // inline fallback (the query retries once, so wait for the first response).
    await page.waitForResponse(
      (r) =>
        r.url().includes('/dashboard/transporter_wise') && r.status() === 500,
      { timeout: 15_000 },
    )
    await expect(page.getByText("Couldn't load this chart.")).toBeVisible({
      timeout: 15_000,
    })

    // Let the retry succeed and confirm the chart comes back
    shouldFail = false
    await page.getByRole('button', { name: 'Retry' }).click()

    await expect(page.getByText("Couldn't load this chart.")).toHaveCount(0, {
      timeout: 15_000,
    })
    await expect(
      page.locator('.recharts-responsive-container').first(),
    ).toBeVisible()
    await expectNoErrorState(page)
  })
})
