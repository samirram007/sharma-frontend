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

const pickSimple = async (btnText, option) => {
  const btn = page
    .locator('[role="combobox"]')
    .filter({ hasText: btnText })
    .first()
  await btn.click()
  await sleep(900)
  const inp = page.locator('[cmdk-input]').last()
  await inp.fill(option)
  await sleep(500)
  const items = page.locator('[cmdk-item]')
  if ((await items.count()) > 0) await items.first().click()
  await sleep(600)
  await page.keyboard.press('Escape')
  await sleep(500)
}
await pickSimple('Select party', 'UltraTech')
await pickSimple('Select stock ledger', 'Stock-in-hand')
await sleep(600)
const itemBtn = page
  .locator('[role="combobox"]')
  .filter({ hasText: 'Select item' })
  .first()
await itemBtn.click()
await sleep(900)
await page.locator('[cmdk-input]').last().fill('ULTRATECH COMPOSITE SUPER')
await sleep(500)
await page.locator('[cmdk-item]').first().click()
await sleep(700)
await page.keyboard.press('Escape')
await sleep(600)

const gb = page
  .locator('[role="combobox"]')
  .filter({ hasText: 'Select godown' })
  .first()
await gb.waitFor({ state: 'visible', timeout: 10000 })
await gb.click()
await sleep(1200)
const items = page.locator('[cmdk-item]')
console.log('godown options:', await items.count())
const names = []
for (let i = 0; i < (await items.count()); i++) {
  names.push(((await items.nth(i).innerText()) || '').trim().slice(0, 50))
}
console.log('names:', JSON.stringify(names.slice(0, 8)))
// pick "Rail Head Adina" (stock 1796)
for (let i = 0; i < (await items.count()); i++) {
  const t = (await items.nth(i).innerText()) || ''
  if (t.includes('Rail Head Adina')) {
    console.log('clicking item', i)
    await items.nth(i).click()
    break
  }
}
await sleep(3000)
const full = await page.evaluate(() => document.body.innerText)
const idx = full.indexOf('Adina Zone')
const idx2 = full.indexOf('Batch')
console.log('region:', full.slice(idx2 - 300, idx2 + 600).replace(/\n/g, ' | '))
// batch button (combobox with batch number text) — check for it
const batchCombos = page.locator('[role="combobox"]')
console.log('combobox texts now:')
for (let i = 0; i < (await batchCombos.count()); i++) {
  console.log(
    '  ',
    JSON.stringify(((await batchCombos.nth(i).innerText()) || '').slice(0, 60)),
  )
}
await page.screenshot({ path: '_dn9.png' })
await browser.close()
