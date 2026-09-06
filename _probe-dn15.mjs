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
await page.locator('[cmdk-input]').last().fill('PREMIUM')
await sleep(500)
await page.locator('[cmdk-item]').first().click()
await sleep(700)
await page.keyboard.press('Escape')
await sleep(600)

// godown with empty-batch data: list them w/ stock
const gb = page
  .locator('[role="combobox"]')
  .filter({ hasText: 'Select godown' })
  .first()
await gb.waitFor({ state: 'visible', timeout: 10000 })
await gb.click()
await sleep(1200)
const gItems = page.locator('[cmdk-item]')
const optTexts = []
for (let i = 0; i < (await gItems.count()); i++)
  optTexts.push(
    ((await gItems.nth(i).innerText()) || '').trim().replace(/\n/g, ' '),
  )
console.log('godowns:', JSON.stringify(optTexts.slice(1, 8)))
for (let i = 0; i < (await gItems.count()); i++) {
  const t = optTexts[i]
  if (t && t.includes('Ashish Ghosh')) {
    await gItems.nth(i).click()
    break
  }
}
await sleep(3000)
// batch combobox
let batchBtn = null
const combos = page.locator('[role="combobox"]')
for (let i = 0; i < (await combos.count()); i++) {
  const t = ((await combos.nth(i).innerText()) || '').trim()
  if (/\d/.test(t) && t.includes('Mt')) {
    batchBtn = combos.nth(i)
    console.log('batch combo idx', i, JSON.stringify(t.slice(0, 50)))
    break
  }
}
if (!batchBtn) {
  console.log('no batch combo')
  await browser.close()
  process.exit(0)
}
await batchBtn.click()
await sleep(1800)
const snap = async (label) => {
  const v = await page.evaluate(() => {
    const items = [...document.querySelectorAll('[cmdk-item]')]
    return {
      n: items.length,
      list: items.slice(0, 8).map((i) => ({
        sel: i.getAttribute('aria-selected'),
        v: (i.getAttribute('data-value') || '').slice(0, 14),
        txt: (i.textContent || '').trim().slice(0, 18),
      })),
    }
  })
  console.log(label, JSON.stringify(v))
}
await snap('OPEN ')
await page.keyboard.press('ArrowDown')
await sleep(400)
await snap('D1    ')
await page.keyboard.press('ArrowDown')
await sleep(400)
await snap('D2    ')
await page.keyboard.press('ArrowDown')
await sleep(400)
await snap('D3    ')
await browser.close()
