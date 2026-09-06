import { chromium } from '@playwright/test'

const API = 'http://localhost:8000/api'
const APP = 'http://localhost:5173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const login = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@admin.com', password: 'password' }),
})
const { token } = await login.json()

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
})
const page = await context.newPage()
await page.addInitScript((t) => localStorage.setItem('auth_token', t), token)

page.on('pageerror', (err) =>
  console.log('PAGE ERROR:', String(err).slice(0, 200)),
)

await page.goto(`${APP}/dashboard`, { waitUntil: 'domcontentloaded' })
await sleep(5000)

// What roles does the admin user have?
const profile = await page.evaluate(async () => {
  const res = await fetch('/api/auth/profile', {
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
  })
  const json = await res.json()
  return json.data?.roles?.map((r) => r.code)
})
console.log('admin roles:', JSON.stringify(profile))

// Navigate to the Menu Manager.
await page.goto(`${APP}/administration/menu_manager`, {
  waitUntil: 'domcontentloaded',
})
await sleep(4000)
console.log('url after nav:', page.url())
const body = await page
  .locator('body')
  .innerText()
  .catch(() => '')
console.log(
  'shows forbidden:',
  body.includes('Access Denied') ||
    body.includes('Forbidden') ||
    body.includes('forbidden'),
)
console.log('body head:', body.slice(0, 180).replace(/\n+/g, ' | '))

await page.screenshot({ path: '_mm-check.png' })
await browser.close()
