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
await sleep(400)

const pick = async (btnText, option) => {
  const btn = page
    .locator(`[role="combobox"]`)
    .filter({ hasText: btnText })
    .first()
  await btn.click()
  await sleep(900)
  const items = page.locator('[cmdk-item]')
  const n = await items.count()
  console.log(`pick ${btnText} -> items:${n}`)
  for (let i = 0; i < n; i++) {
    const t = (await items.nth(i).innerText()) || ''
    if (t.toLowerCase().includes(option.toLowerCase())) {
      await items.nth(i).click()
      break
    }
  }
  await sleep(900)
}
await pick('Select party', 'UltraTech Cement')
await pick('Select stock ledger', 'Stock-in-hand')
await pick('Select item', 'ULTRATECH COMPOSITE SUPER')
// godown combobox says "Select godown"
const gb = page
  .locator('[role="combobox"]')
  .filter({ hasText: 'Select godown' })
  .first()
await gb.click()
await sleep(900)
const items = page.locator('[cmdk-item]')
console.log('godown items:', await items.count())
for (let i = 0; i < (await items.count()); i++) {
  const t = (await items.nth(i).innerText()) || ''
  console.log('  godown item:', t.slice(0, 40))
}
await items.first().click()
await sleep(1500)
console.log(
  'BODY3:',
  (await page.evaluate(() => document.body.innerText))
    .slice(0, 1400)
    .replace(/\n/g, ' | '),
)
await page.screenshot({ path: '_dn-form4.png' })
await browser.close()
