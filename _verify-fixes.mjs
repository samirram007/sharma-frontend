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
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.addInitScript((t) => localStorage.setItem('auth_token', t), token)

const result = { steps: [] }
const step = (name, data) => {
  result.steps.push({ name, ...data })
  console.log(`[ok] ${name}`, JSON.stringify(data ?? {}))
}

// 1) Top menu bar: hidden sub menu item must NOT appear in the Reports dropdown
await page.goto(`${APP}/dashboard`, { waitUntil: 'domcontentloaded' })
await sleep(4500)
await page.locator('header nav span:has-text("Reports")').first().click()
await sleep(1200)
const dropdownText = await page
  .locator('[data-radix-menu-content], [role="menu"]')
  .last()
  .innerText()
  .catch(() => '')
step('top menu hides invisible sub items', {
  financialStatementsHidden: !dropdownText.includes('Financial Statements'),
  hasDayBook: dropdownText.includes('Day Book'),
  hasBalanceSheet: dropdownText.includes('Balance Sheet'),
})

// 2) Shortcuts icons render with visible pixels
await page.goto(`${APP}/new-tab`, { waitUntil: 'domcontentloaded' })
await sleep(4000)
const iconStats = await page
  .locator('[data-testid="shortcut-card"]')
  .evaluateAll(async (cards) => {
    const out = []
    for (const card of cards.slice(0, 6)) {
      const title = card.querySelector('span.text-sm')?.textContent?.trim()
      const svg = card.querySelector('span.flex.h-12.w-12 svg')
      if (!svg) {
        out.push({ title, svg: 'NONE' })
        continue
      }
      const xml = new XMLSerializer().serializeToString(svg)
      const url = URL.createObjectURL(
        new Blob([xml], { type: 'image/svg+xml' }),
      )
      const img = new Image()
      await new Promise((res, rej) => {
        img.onload = res
        img.onerror = rej
        img.src = url
      })
      const canvas = document.createElement('canvas')
      canvas.width = 48
      canvas.height = 48
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 48, 48)
      URL.revokeObjectURL(url)
      const px = ctx.getImageData(0, 0, 48, 48).data
      let solid = 0
      for (let i = 3; i < px.length; i += 4) if (px[i] > 10) solid++
      out.push({ title, visiblePct: Math.round((solid / 2304) * 1000) / 10 })
    }
    return out
  })
step('shortcut icons render', {
  allVisible: iconStats.every((i) => i.visiblePct > 0),
  iconStats,
})

// 3) Error pages: details panel + links
for (const [path, heading] of [
  ['/404', 'Page Not Found'],
  ['/500', 'Something Went Wrong'],
  ['/401', 'Unauthorized Access'],
  ['/403', 'Access Denied'],
  ['/503', 'Under Maintenance'],
]) {
  await page.goto(`${APP}${path}`, { waitUntil: 'domcontentloaded' })
  await sleep(2500)
  const hasHeading = await page.locator(`h2:has-text("${heading}")`).count()
  const detailsPanel = await page.locator('text=Error details').count()
  const whatYouCanDo = await page.locator('text=What you can do').count()
  const buttons = await page
    .locator(
      'button:has-text("Go Back"), button:has-text("Sign In"), button:has-text("Retry"), button:has-text("Try Again")',
    )
    .count()
  step(`error page ${path}`, {
    heading: hasHeading > 0,
    detailsPanel: detailsPanel > 0,
    hints: whatYouCanDo > 0,
    actionButtons: buttons,
  })
}

await page.screenshot({ path: '_verify-500.png' })
step('screenshot saved', { file: '_verify-500.png' })

await browser.close()
console.log('\nRESULT', JSON.stringify(result, null, 1))
