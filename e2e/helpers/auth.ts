import { expect, type Page } from '@playwright/test'

/** Laravel API base URL (bypasses the Vite proxy for the login call itself). */
const BACKEND_API_URL = process.env.E2E_API_URL ?? 'http://localhost:8000/api'

/** Seeded demo admin credentials (see sharma-api/database/sql/sample_data.sql). */
export const DEMO_ADMIN = {
  email: 'admin@admin.com',
  password: 'password',
}

/**
 * Logs in via the Laravel API and seeds the JWT into localStorage under the same
 * key the app uses (`auth_token`). The SPA's axios client reads it and sends it
 * as an `Authorization: Bearer` header, exactly like a real session.
 *
 * Call this in `beforeEach` (or once per test) before navigating to a page.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const response = await page.request.post(`${BACKEND_API_URL}/auth/login`, {
    data: { email: DEMO_ADMIN.email, password: DEMO_ADMIN.password },
  })

  if (!response.ok()) {
    throw new Error(
      `E2E login failed (${response.status()}): ${await response.text()}`,
    )
  }

  const body = (await response.json()) as { token?: string }
  if (!body.token) {
    throw new Error('E2E login succeeded but returned no token')
  }

  // Runs before every page script, so the token is in place before any request fires.
  await page.addInitScript((token: string) => {
    localStorage.setItem('auth_token', token)
  }, body.token)
}

/**
 * Asserts the app shell rendered instead of an error boundary. The GeneralError
 * page shows "Something Went Wrong" and the global QueryCache handler toasts
 * "Internal Server Error!" on unexpected 500s — both are regression markers.
 */
export async function expectNoErrorState(page: Page): Promise<void> {
  await expect(page.getByText('Something Went Wrong')).toHaveCount(0)
  await expect(page.getByText('Internal Server Error!')).toHaveCount(0)
}
