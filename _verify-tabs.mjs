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

const strip = page.locator('[data-testid="recent-tabs-strip"]')
const tabTitles = () =>
  strip
    .locator('a[title]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('title')))
const recents = () =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem('recent-pages-v1') ?? '[]').map(
      (p) => p.href,
    ),
  )

// 0) Fresh state: Dashboard tab by default
await page.goto(`${APP}/dashboard`, { waitUntil: 'domcontentloaded' })
await sleep(4000)
await page.evaluate(() => localStorage.removeItem('recent-pages-v1'))
await page.reload({ waitUntil: 'domcontentloaded' })
await sleep(4000)
const t0 = await tabTitles()
step('dashboard tab by default', {
  first: t0[0],
  hasDashboard: t0.includes('Dashboard'),
})

// 1) Sequential visits: each new tab opens right after the previously active one
const seq = [
  '/transactions/vouchers/receipt_note',
  '/transactions/vouchers/delivery_note',
  '/transactions/freight',
]
for (const path of seq) {
  await page.goto(`${APP}${path}`, { waitUntil: 'domcontentloaded' })
  await sleep(3000)
}
const t1 = await tabTitles()
step('sequential visits order', { tabs: t1 })

// 2) SPA: go back to the first tab, then open a NEW page from the top nav —
//    the new tab must appear right after the previously active tab (not at end)
await strip.locator('a[title="Received (GRN)"]').click()
await sleep(2500)
await page.locator('header nav a:has-text("Conversion")').first().click()
await sleep(3000)
const t2 = await tabTitles()
step('new tab opens after last active tab', {
  tabs: t2,
  conversionAfterReceived: t2[1] === 'Received (GRN)' && t2[2] === 'Conversion',
})

// 3) Activating an existing tab must not reorder
const before = await tabTitles()
await strip.locator('a[title="Freight"]').click()
await sleep(2500)
const after = await tabTitles()
step('order unchanged on activation', {
  same: JSON.stringify(before) === JSON.stringify(after),
})

// 4) Drag swap between two non-pinned tabs
const boxes = await strip.locator(':scope > div').evaluateAll((els) =>
  els.map((el) => {
    const r = el.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  }),
)
await page.mouse.move(boxes[1].x, boxes[1].y)
await page.mouse.down()
for (let i = 1; i <= 10; i++) {
  const t = i / 10
  await page.mouse.move(
    boxes[1].x + (boxes[2].x - boxes[1].x) * t,
    boxes[1].y + (boxes[2].y - boxes[1].y) * t,
  )
  await sleep(40)
}
await page.mouse.up()
await sleep(1200)
const afterDrag = await tabTitles()
step('drag reorders tabs', {
  swapped: afterDrag[1] === before[2] && afterDrag[2] === before[1],
  before: before.slice(1, 3),
  afterDrag: afterDrag.slice(1, 3),
})

// 5) Close removes a tab
const closeBtns = strip.locator('[aria-label^="Close "]')
const beforeClose = await tabTitles()
await closeBtns.first().click()
await sleep(800)
const afterClose = await tabTitles()
step('close removes tab', {
  removed: !afterClose.includes(beforeClose[1]),
})

// 6) Unauthorized/stale recents must NOT render
await page.evaluate(() => {
  const cur = JSON.parse(localStorage.getItem('recent-pages-v1') ?? '[]')
  localStorage.setItem(
    'recent-pages-v1',
    JSON.stringify([...cur, { title: 'Secret', href: '/secret-route' }]),
  )
})
await page.reload({ waitUntil: 'domcontentloaded' })
await sleep(4000)
const t6 = await tabTitles()
step('stale/unpermitted tab hidden', {
  secretHidden: !t6.includes('Secret'),
  tabs: t6,
})

// 6b) Visit enough pages to exceed the new-tab "All visited" cap (8)
for (const path of [
  '/masters/organization/company',
  '/masters/organization/fiscal_year',
  '/masters/organization/currency',
  '/masters/organization/country',
  '/masters/organization/state',
  '/reports/balance_sheet',
]) {
  await page.goto(`${APP}${path}`, { waitUntil: 'domcontentloaded' })
  await sleep(2500)
}

// 7) New-tab page: cap, search filter, star toggle
await page.goto(`${APP}/new-tab`, { waitUntil: 'domcontentloaded' })
await sleep(3500)
const cardCount = await page.locator('[data-testid="shortcut-card"]').count()
const moreNote = await page
  .locator('main p:has-text("more. Use the search box")')
  .textContent()
  .catch(() => '')
step('all-visited capped', { cardCount, moreNote: moreNote?.trim() })

await page.getByLabel('Search shortcuts').fill('freight')
await sleep(800)
const searched = await page
  .locator('[data-testid="shortcut-card"] span.text-sm')
  .allTextContents()
step('search filters shortcuts', {
  count: searched.length,
  allMatch: searched.every((s) => s.toLowerCase().includes('freight')),
})

await page.getByLabel('Search shortcuts').fill('')
await sleep(500)
const firstCard = page.locator('[data-testid="shortcut-card"]').first()
const firstTitle = await firstCard.locator('span.text-sm').textContent()
await firstCard.locator('button[aria-label^="Add "]').click()
await sleep(800)
const favHeader = await page.locator('main h2:has-text("Favorites")').count()
const favTitles = await page
  .locator(
    'main h2:has-text("Favorites") + div [data-testid="shortcut-card"] span.text-sm',
  )
  .allTextContents()
step('star toggle adds to Favorites', {
  favSectionShown: favHeader > 0,
  favTitles,
  containsStarred: favTitles.includes(firstTitle),
})

// unstar again to leave state clean
await page
  .locator(
    `[data-testid="shortcut-card"] button[aria-label="Remove ${firstTitle} from favorites"]`,
  )
  .first()
  .click()
await sleep(500)

await page.screenshot({ path: '_verify-new-tab.png' })
await page.goto(`${APP}/dashboard`, { waitUntil: 'domcontentloaded' })
await sleep(2500)
await page.screenshot({ path: '_verify-tabs.png' })
step('screenshots saved', {
  tabs: '_verify-tabs.png',
  newTab: '_verify-new-tab.png',
})

await browser.close()
console.log('\nRESULT', JSON.stringify(result, null, 1))
