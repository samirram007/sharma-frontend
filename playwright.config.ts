import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright e2e config.
 *
 * Prerequisites (documented in knowledge.md):
 * - Laravel backend running on http://localhost:8000 (with seeded demo users)
 * - `pnpm exec playwright install chromium` once after install
 *
 * The Vite dev server is started automatically (or reused if already running).
 * The backend is NOT started here — it needs its own database.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Cap local workers so parallel tests don't hammer the shared Vite dev server
  // and Laravel backend (which also live under test).
  workers: process.env.CI ? 1 : 2,
  globalSetup: './e2e/global-setup.ts',
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
