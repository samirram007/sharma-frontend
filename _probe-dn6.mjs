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

const closeAnySheet = async () => {
  const esc = page.locator('body')
  await page.keyboard.press('Escape')
  await sleep(600)
}
const pickByText = async (btnText, option) => {
  const btn = page
    .locator('[role="combobox"]')
    .filter({ hasText: btnText })
    .first()
  await closeAnySheet()
  await btn.click()
  await sleep(1000)
  // type into the search
  const inp = page.locator('[cmdk-input]').last()
  await inp.fill(option)
  await sleep(600)
  const items = page.locator('[cmdk-item]')
  const n = await items.count()
  console.log(`${btnText}: options shown: ${n}`)
  if (n > 0) {
    await items.first().click()
  }
  await sleep(800)
  await closeAnySheet()
}
await pickByText('Select party', 'UltraTech')
await pickByText('Select stock ledger', 'Stock-in-hand')
await sleep(1200)
// item picker in the grid row (Particulars): combobox without text
const allCombos = page.locator('[role="combobox"]')
console.log('combobox count:', await allCombos.count())
for (let i = 0; i < (await allCombos.count()); i++) {
  console.log(
    ' combo',
    i,
    JSON.stringify(((await allCombos.nth(i).innerText()) || '').slice(0, 40)),
  )
}
// stock item is the first combobox after the two header ones
const itemBtn = page
  .locator('[role="combobox"]')
  .filter({ hasText: 'Select item' })
  .first()
if (await itemBtn.count()) {
  await itemBtn.click()
  await sleep(1000)
  const inp = page.locator('[cmdk-input]').last()
  await inp.fill('ULTRATECH COMPOSITE SUPER')
  await sleep(600)
  await page.locator('[cmdk-item]').first().click()
  await sleep(900)
  await closeAnySheet()
}
console.log(
  'BODY:',
  (await page.evaluate(() => document.body.innerText))
    .slice(0, 1300)
    .replace(/\n/g, ' | '),
)
await page.screenshot({ path: '_dn5.png' })
await browser.close()
