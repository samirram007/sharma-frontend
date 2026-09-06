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
await sleep(500)

const clickCombobox = async (labelPrefix) => {
  const btn = page
    .locator(`[role="combobox"]:has-text("${labelPrefix}")`)
    .first()
  await btn.click()
  await sleep(900)
  // search input inside the opened command list
  const cmdInput = page.locator('[cmdk-input]').last()
  return cmdInput
}
const chooseInCombobox = async (labelPrefix, optionText) => {
  await clickCombobox(labelPrefix)
  const items = page.locator('[cmdk-item]')
  const n = await items.count()
  let picked = false
  for (let i = 0; i < n; i++) {
    const t = (await items.nth(i).innerText()) || ''
    if (t.includes(optionText)) {
      await items.nth(i).click()
      picked = true
      break
    }
  }
  await sleep(600)
  return picked
}

// 1) party
await chooseInCombobox('Select party', 'UltraTech Cement')
console.log('party picked')
// 2) stock ledger
await chooseInCombobox('Select stock ledger', 'Stock-in-hand')
console.log('ledger picked')
await sleep(1500)
await page.screenshot({ path: '_dn-form2.png' })

// Now find the particulars (stock item combobox) in the entry grid and the godown rows
const body = await page.evaluate(() => document.body.innerText.slice(0, 1200))
console.log('BODY:', body.replace(/\n/g, ' | '))
await browser.close()
