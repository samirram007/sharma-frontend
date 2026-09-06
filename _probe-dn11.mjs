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
for (let i = 0; i < (await items.count()); i++) {
  const t = (await items.nth(i).innerText()) || ''
  if (t.includes('Rail Head Adina')) {
    await items.nth(i).click()
    break
  }
}
await sleep(2500)

// batch combobox = 4th one
const batchBtn = page.locator('[role="combobox"]').nth(3)
console.log(
  'batch trigger text:',
  JSON.stringify(((await batchBtn.innerText()) || '').trim().slice(0, 40)),
)
await batchBtn.click()
await sleep(1200)

const selInfo = async (label) => {
  const v = await page.evaluate(() => {
    const items = [...document.querySelectorAll('[cmdk-item]')]
    const sel = items
      .filter((i) => i.getAttribute('aria-selected') === 'true')
      .map((i) => (i.textContent || '').trim().slice(0, 30))
    const input = document.querySelector('[cmdk-input]')
    return {
      count: items.length,
      selected: sel,
      active: document.activeElement
        ? document.activeElement.getAttribute('cmdk-input') !== null
          ? 'search-input'
          : document.activeElement.tagName
        : 'none',
      ariaActive: input ? input.getAttribute('aria-activedescendant') : null,
    }
  })
  console.log(label, JSON.stringify(v))
}
await selInfo('OPEN        ')
await page.keyboard.press('ArrowDown')
await sleep(400)
await selInfo('AFTER DOWN 1')
await page.keyboard.press('ArrowDown')
await sleep(400)
await selInfo('AFTER DOWN 2')
await page.keyboard.press('ArrowUp')
await sleep(400)
await selInfo('AFTER UP 1  ')
await page.screenshot({ path: '_dn-batch.png' })
await browser.close()
