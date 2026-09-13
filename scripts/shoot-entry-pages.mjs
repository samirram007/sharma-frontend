// One-off: login and screenshot the entry pages for visual review.
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5173'
const browser = await chromium.launch()
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 } })
).newPage()

// Block the Reverb websocket noise from failing screenshots
page.on('console', () => {})

await page.goto(`${BASE}/sign-in`, { waitUntil: 'networkidle' })
await page.getByPlaceholder('name@example.com').fill('admin@admin.com')
await page.locator('input[type="password"]').first().fill('password')
await page.click('button:has-text("Login")')
await page.waitForURL(/dashboard/, { timeout: 15000 })
await page.waitForTimeout(1000)

const shots = [
  ['user-new', '/administration/user/new'],
  ['user-1', '/administration/user/1'],
  ['company-new', '/masters/organization/company/new'],
  ['company-1', '/masters/organization/company/1'],
]

for (const [name, path] of shots) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `scripts/shots/${name}.png`, fullPage: true })
  console.log(`saved scripts/shots/${name}.png`)
}

await browser.close()
