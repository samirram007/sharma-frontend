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
const gItems = page.locator('[cmdk-item]')
for (let i = 0; i < (await gItems.count()); i++) {
  const t = (await gItems.nth(i).innerText()) || ''
  if (t.includes('Rail Head Adina')) {
    await gItems.nth(i).click()
    break
  }
}
await sleep(3000)

// batch combobox (idx 4)
const batchBtn = page.locator('[role="combobox"]').nth(4)
await batchBtn.click()
await sleep(1500)
// select the SECOND batch via Enter (arrow down + enter)
await page.keyboard.press('ArrowDown')
await sleep(400)
await page.keyboard.press('Enter')
await sleep(1200)
console.log(
  'trigger after select:',
  JSON.stringify(((await batchBtn.innerText()) || '').trim().slice(0, 40)),
)
// reopen
await batchBtn.click()
await sleep(1500)
const selInfo = async (label) => {
  const v = await page.evaluate(() => {
    const items = [...document.querySelectorAll('[cmdk-item]')]
    const info = items.map((i) => ({
      sel: i.getAttribute('aria-selected'),
      txt: (i.textContent || '').trim().slice(0, 22),
      check: !!i.querySelector('svg:not([class*="opacity-0"])'),
      disabled: i.getAttribute('aria-disabled'),
    }))
    const input = document.querySelector('[cmdk-input]')
    return {
      count: items.length,
      items: info.slice(0, 6),
      ariaActive: input ? input.getAttribute('aria-activedescendant') : null,
    }
  })
  console.log(label, JSON.stringify(v, null, 0))
}
await selInfo('REOPENED  ')
await page.keyboard.press('ArrowDown')
await sleep(400)
await selInfo('DOWN 1    ')
await page.keyboard.press('ArrowDown')
await sleep(400)
await selInfo('DOWN 2    ')
await browser.close()
