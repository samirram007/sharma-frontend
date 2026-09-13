// Smoke-test: verify the new user/company entry pages render without errors.
// Usage: node scripts/verify-entry-pages.mjs [base-url]
// Exits non-zero if any console error, page error, or failed API response occurs.

import { chromium } from '@playwright/test'

const BASE = process.argv[2] ?? 'http://localhost:5173'
const results = []
let failures = 0

function report(pageName, type, message) {
  results.push({ page: pageName, type, message })
  if (type === 'error') failures++
}

const collected = {
  errors: [],
  pageErrors: [],
  failedRequests: [],
  badResponses: [],
}

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

page.on('console', (msg) => {
  if (msg.type() === 'error') collected.errors.push(msg.text())
})
page.on('pageerror', (err) => collected.pageErrors.push(err.message))
page.on('requestfailed', (req) => {
  collected.failedRequests.push(
    `${req.method()} ${req.url()} — ${req.failure()?.errorText}`,
  )
})
page.on('response', (res) => {
  if (res.status() >= 400 && res.request().resourceType() !== 'document') {
    collected.badResponses.push(`${res.status()} ${res.url()}`)
  }
})

function clearCollected() {
  for (const key of Object.keys(collected)) collected[key].length = 0
}

async function checkPage(name, url, expects) {
  clearCollected()
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  const text = (await page.textContent('body')) ?? ''
  for (const expected of expects ?? []) {
    const found = text.includes(expected)
    results.push({
      page: name,
      type: found ? 'ok' : 'error',
      message: `expected text "${expected}" ${found ? 'found' : 'MISSING'}`,
    })
    if (!found) failures++
  }

  for (const e of collected.errors)
    report(name, 'error', `console.error: ${e.slice(0, 200)}`)
  for (const e of collected.pageErrors)
    report(name, 'error', `pageerror: ${e.slice(0, 200)}`)
  for (const r of collected.failedRequests)
    report(name, 'error', `requestfailed: ${r}`)
  for (const r of collected.badResponses)
    report(name, 'warn', `HTTP >=400: ${r}`)
}

// ── 1. Login ────────────────────────────────────────────────────────────
await page.goto(`${BASE}/sign-in`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

// Debug: dump what actually rendered if the form is missing
const emailInput = page.getByPlaceholder('name@example.com').first()
const passwordInput = page.locator('input[type="password"]').first()
if ((await emailInput.count()) === 0 || (await passwordInput.count()) === 0) {
  console.log('DEBUG: no email input found at /sign-in')
  console.log('DEBUG: url =', page.url())
  console.log('DEBUG: title =', await page.title())
  const body = (await page.textContent('body')) ?? ''
  console.log('DEBUG: body text (first 600 chars):', body.slice(0, 600))
  await page.screenshot({ path: 'sign-in-debug.png', fullPage: true })
  const html = await page.content()
  console.log(
    'DEBUG: input count =',
    await page.locator('input').count(),
    '| html length =',
    html.length,
  )
  process.exit(1)
}

await emailInput.fill('admin@admin.com')
await passwordInput.fill('password')
await page.click('button:has-text("Login")')
await page.waitForURL(/^(?!.*sign-in).*$/, { timeout: 15000 }).catch(() => {})
await page.waitForTimeout(1500)

const loggedIn = !page.url().includes('sign-in')
report(
  'login',
  loggedIn ? 'ok' : 'error',
  `login ${loggedIn ? `succeeded (now at ${page.url()})` : 'FAILED — still at sign-in'}`,
)
if (!loggedIn) failures++

// ── 2. User entry page (new) ───────────────────────────────────────────
await checkPage('user/new', '/administration/user/new', [
  'Add New User',
  'Account Information',
  'Security',
  'Status',
  'Create User',
])

// ── 3. Existing user detail page ───────────────────────────────────────
await checkPage('user/1', '/administration/user/1', [
  'Account Information',
  'Save Changes',
])

// ── 4. Company entry page (new) ────────────────────────────────────────
await checkPage('company/new', '/masters/organization/company/new', [
  'Add New Company',
  'Basic Information',
  'Contact Information',
  'Tax and Compliance',
  'Address',
  'Create Company',
])

// ── 5. Existing company detail page ────────────────────────────────────
await checkPage('company/1', '/masters/organization/company/1', [
  'Basic Information',
  'Save Changes',
])

await browser.close()

console.log('\n=== Verification results ===')
for (const r of results) {
  const icon = r.type === 'error' ? '✗' : r.type === 'warn' ? '⚠' : '✓'
  console.log(`${icon} [${r.page}] ${r.message}`)
}
console.log(
  `\n${failures === 0 ? '✅ ALL CHECKS PASSED' : `❌ ${failures} failure(s)`}`,
)

process.exit(failures === 0 ? 0 : 1)
