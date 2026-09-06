import { chromium } from '@playwright/test'
const API = 'http://localhost:8000/api',
  APP = 'http://localhost:5173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const login = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@admin.com', password: 'password' }),
})
const { token } = await login.json()
// find parties/stock items/batches via API to know what demo data exists
const h = { Authorization: `Bearer ${token}` }
const j = async (u) => {
  const r = await fetch(API + u, { headers: h })
  return r.json()
}
const ledgers = await j('/ledgers?page=1&per_page=5')
console.log(
  'ledgers sample keys:',
  Object.keys(ledgers).slice(0, 6),
  Array.isArray(ledgers) ? ledgers.length : '',
)
const list = Array.isArray(ledgers) ? ledgers : ledgers.data || []
console.log(
  'first 3 ledgers:',
  JSON.stringify(list.slice(0, 3).map((l) => ({ id: l.id, name: l.name }))),
)
const browser = await chromium.launch({ headless: false, channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } })
await page.addInitScript((t) => {
  localStorage.setItem('auth_token', t)
  localStorage.setItem('vite-ui-theme', 'light')
}, token)
await page.goto(`${APP}/transactions/vouchers/delivery_note`, {
  waitUntil: 'domcontentloaded',
})
await sleep(7000)
await page.evaluate(() => {
  document.documentElement.className = 'light'
})
await page.screenshot({ path: '_dn1.png' })
console.log('title:', await page.title())
console.log(
  'body text head:',
  (await page.evaluate(() => document.body.innerText))
    .slice(0, 400)
    .replace(/\n/g, ' | '),
)
await browser.close()
