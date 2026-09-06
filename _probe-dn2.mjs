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

// Dump visible interactive inputs/comboboxes to understand the form shape
const info = await page.evaluate(() => {
  const out = []
  document
    .querySelectorAll('input, [role="combobox"], button')
    .forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width < 5 || r.height < 5) return
      const s = getComputedStyle(el)
      if (s.visibility === 'hidden' || s.display === 'none') return
      out.push({
        tag: el.tagName,
        role: el.getAttribute('role') || '',
        ph: el.getAttribute('placeholder') || '',
        aria: el.getAttribute('aria-label') || '',
        txt: (el.textContent || '').trim().slice(0, 30),
        id: el.id || '',
      })
    })
  return out.slice(0, 60)
})
console.log('FORM CONTROLS:')
for (const i of info) console.log(' ', JSON.stringify(i))
await page.screenshot({ path: '_dn-form.png' })
await browser.close()
