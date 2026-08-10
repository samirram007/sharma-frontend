import { expect, test } from '@playwright/test'

test.describe('Auth flow', () => {
  test('redirects unauthenticated visitors away from protected pages', async ({
    page,
  }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/sign-in/)
    await expect(page.getByText('Secure Access Portal')).toBeVisible()
  })

  test('sign-in page renders the form', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page).toHaveURL(/\/sign-in/)
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByPlaceholder('********')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })
})
