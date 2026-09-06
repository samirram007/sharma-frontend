import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_TAB,
  canonicalHref,
  isHomeHref,
  pinRecentPage,
  pinnedFirst,
  pushRecentPage,
  readRecentPages,
  readTabs,
  removeRecentPage,
  saveRecentPages,
  tabHrefForPath,
  type RecentPage,
} from './recent-pages'

const STORAGE_KEY = 'recent-pages-v1'

// jsdom doesn't provide window.localStorage in this environment — install a
// faithful in-memory Storage mock (same as src/hooks/use-local-storage.test.ts).
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear() {
    this.store.clear()
  }

  getItem(key: string) {
    return this.store.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value))
  }
}

// jsdom doesn't provide window.localStorage in this environment — install a
// fresh in-memory Storage mock before every test.
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  })
})

const seed = (pages: RecentPage[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pages))
}
const stored = () => readRecentPages()

describe('canonicalHref', () => {
  it('strips trailing slashes but keeps the root', () => {
    expect(canonicalHref('/transactions/vouchers/')).toBe(
      '/transactions/vouchers',
    )
    expect(canonicalHref('/transactions/vouchers')).toBe(
      '/transactions/vouchers',
    )
    expect(canonicalHref('/')).toBe('/dashboard')
  })

  it('maps the home aliases to the pinned home tab', () => {
    expect(canonicalHref('/dashboard')).toBe('/dashboard')
    expect(canonicalHref('/dashboard/')).toBe('/dashboard')
    expect(canonicalHref('/')).toBe(DEFAULT_TAB.href)
  })

  it('isHomeHref recognizes every home alias', () => {
    expect(isHomeHref('/')).toBe(true)
    expect(isHomeHref('/dashboard')).toBe(true)
    expect(isHomeHref('/dashboard/')).toBe(true)
    expect(isHomeHref('/transactions/vouchers/delivery_note')).toBe(false)
  })
})

describe('pushRecentPage', () => {
  it('never records the home page as its own tab', () => {
    pushRecentPage({ title: 'Dashboard', href: '/' })
    pushRecentPage({ title: 'Dashboard', href: '/dashboard' })
    pushRecentPage({ title: 'Dashboard', href: '/dashboard/' })
    expect(readTabs().map((p) => p.href)).toEqual(['/dashboard'])
  })

  it('dedupes URL aliases of the same page (trailing slash)', () => {
    pushRecentPage({
      title: 'Delivery Note',
      href: '/transactions/vouchers/delivery_note',
    })
    pushRecentPage({
      title: 'Delivery Note',
      href: '/transactions/vouchers/delivery_note/',
    })
    expect(stored()).toHaveLength(1)
    expect(stored()[0].href).toBe('/transactions/vouchers/delivery_note')
  })

  it('stores the canonical (slash-less) href', () => {
    pushRecentPage({ title: 'Freight', href: '/transactions/freight/' })
    expect(stored()[0]).toEqual({
      title: 'Freight',
      href: '/transactions/freight',
      pinned: false,
    })
  })

  it('does not duplicate a page that is already open', () => {
    pushRecentPage({
      title: 'Delivery Note',
      href: '/transactions/vouchers/delivery_note',
    })
    pushRecentPage({
      title: 'Delivery Note',
      href: '/transactions/vouchers/delivery_note',
    })
    expect(stored()).toHaveLength(1)
  })

  it('inserts a new tab right after the previously active tab', () => {
    pushRecentPage({
      title: 'Received (GRN)',
      href: '/transactions/vouchers/receipt_note',
    })
    pushRecentPage({
      title: 'Delivery Note',
      href: '/transactions/vouchers/delivery_note',
    })
    pushRecentPage(
      {
        title: 'Conversion',
        href: '/transactions/vouchers/conversion_journal',
      },
      '/transactions/vouchers/delivery_note',
    )
    expect(stored().map((p) => p.href)).toEqual([
      '/transactions/vouchers/receipt_note',
      '/transactions/vouchers/delivery_note',
      '/transactions/vouchers/conversion_journal',
    ])
  })

  it('inserts a tab opened from the pinned home right after it', () => {
    pushRecentPage({
      title: 'Received (GRN)',
      href: '/transactions/vouchers/receipt_note',
    })
    pushRecentPage(
      { title: 'Delivery Note', href: '/transactions/vouchers/delivery_note' },
      '/dashboard', // previously active tab was home
    )
    expect(stored().map((p) => p.href)).toEqual([
      '/transactions/vouchers/delivery_note',
      '/transactions/vouchers/receipt_note',
    ])
  })

  it('treats a nested record URL as part of its section tab for insertion', () => {
    pushRecentPage({
      title: 'Delivery Note',
      href: '/transactions/vouchers/delivery_note',
    })
    pushRecentPage(
      { title: 'Received (GRN)', href: '/transactions/vouchers/receipt_note' },
      // Previously active: the Delivery Note record edit screen.
      '/transactions/vouchers/delivery_note/7045',
    )
    expect(stored().map((p) => p.href)).toEqual([
      '/transactions/vouchers/delivery_note',
      '/transactions/vouchers/receipt_note',
    ])
  })
})

describe('readTabs', () => {
  it('always pins the home tab first, even with nothing stored', () => {
    expect(readTabs()).toEqual([DEFAULT_TAB])
  })

  it('cleans stale home-alias entries from storage', () => {
    seed([
      { title: 'Dashboard', href: '/' },
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Delivery Note', href: '/transactions/vouchers/delivery_note' },
    ])
    expect(readTabs().map((p) => p.href)).toEqual([
      '/dashboard',
      '/transactions/vouchers/delivery_note',
    ])
    // The cleanup is persisted so the stale tab never resurfaces.
    expect(stored().map((p) => p.href)).toEqual([
      '/transactions/vouchers/delivery_note',
    ])
  })

  it('normalizes and merges leftover non-canonical entries while reading', () => {
    seed([
      { title: 'Delivery Note', href: '/transactions/vouchers/delivery_note/' },
      { title: 'Delivery Note', href: '/transactions/vouchers/delivery_note' },
    ])
    expect(readTabs().map((p) => p.href)).toEqual([
      '/dashboard',
      '/transactions/vouchers/delivery_note',
    ])
    expect(stored()).toHaveLength(1)
  })
})

describe('pinning', () => {
  it('pinRecentPage marks a page pinned and moves it to the front of storage', () => {
    pushRecentPage({
      title: 'Received (GRN)',
      href: '/transactions/vouchers/receipt_note',
    })
    pushRecentPage({
      title: 'Delivery Note',
      href: '/transactions/vouchers/delivery_note',
    })
    pinRecentPage('/transactions/vouchers/receipt_note', true)
    const stored = readRecentPages()
    expect(stored[0]).toEqual({
      title: 'Received (GRN)',
      href: '/transactions/vouchers/receipt_note',
      pinned: true,
    })
    expect(stored[1]).toEqual({
      title: 'Delivery Note',
      href: '/transactions/vouchers/delivery_note',
      pinned: false,
    })
  })

  it('readTabs orders pinned pages right after the home tab', () => {
    pushRecentPage({ title: 'Freight', href: '/transactions/freight' })
    pushRecentPage({
      title: 'Received (GRN)',
      href: '/transactions/vouchers/receipt_note',
    })
    pinRecentPage('/transactions/freight', true)
    expect(readTabs().map((p) => p.href)).toEqual([
      '/dashboard',
      '/transactions/freight',
      '/transactions/vouchers/receipt_note',
    ])
  })

  it('keeps pin order when several pages are pinned', () => {
    pushRecentPage({
      title: 'Currency',
      href: '/masters/organization/currency',
    })
    pushRecentPage({ title: 'Freight', href: '/transactions/freight' })
    pushRecentPage({ title: 'Day Book', href: '/reports/day_book' })
    // First-pinned tab leads: Freight is pinned first, so it sits ahead of
    // Day Book even though Day Book was pinned later.
    pinRecentPage('/reports/day_book', true)
    pinRecentPage('/transactions/freight', true)
    expect(readTabs().map((p) => p.href)).toEqual([
      '/dashboard',
      '/transactions/freight',
      '/reports/day_book',
      '/masters/organization/currency',
    ])
  })

  it('unpinning drops the pinned flag and moves the page back after pinned ones', () => {
    pushRecentPage({ title: 'Freight', href: '/transactions/freight' })
    pushRecentPage({ title: 'Day Book', href: '/reports/day_book' })
    pinRecentPage('/transactions/freight', true)
    pinRecentPage('/transactions/freight', false)
    expect(readTabs().map((p) => p.href)).toEqual([
      '/dashboard',
      '/reports/day_book',
      '/transactions/freight',
    ])
    expect(
      readTabs().find((p) => p.href === '/transactions/freight')?.pinned,
    ).toBe(false)
  })

  it('cannot pin or unpin the home tab', () => {
    pinRecentPage('/dashboard', true)
    pinRecentPage('/', false)
    expect(readTabs()).toEqual([DEFAULT_TAB])
  })

  it('pinnedFirst keeps relative order inside each group', () => {
    const list = [
      { title: 'a', href: '/a', pinned: false },
      { title: 'b', href: '/b', pinned: true },
      { title: 'c', href: '/c', pinned: false },
      { title: 'd', href: '/d', pinned: true },
    ]
    // Without an explicit index-0 home entry the first item stays put, then
    // the remaining items partition by their pinned flag.
    expect(pinnedFirst(list).map((p) => p.href)).toEqual([
      '/a',
      '/b',
      '/d',
      '/c',
    ])
  })

  it('pinnedFirst always keeps the entry at index 0 (home tab) first', () => {
    // The Dashboard home tab is implicit (never stored with pinned: true), so
    // the stable sort must not bury it under user-pinned tabs.
    const list = [
      { title: 'Dashboard', href: '/dashboard', pinned: false },
      {
        title: 'Delivery Note',
        href: '/transactions/vouchers/delivery_note',
        pinned: true,
      },
      {
        title: 'Received (GRN)',
        href: '/transactions/vouchers/receipt_note',
        pinned: false,
      },
    ]
    expect(pinnedFirst(list).map((p) => p.href)).toEqual([
      '/dashboard',
      '/transactions/vouchers/delivery_note',
      '/transactions/vouchers/receipt_note',
    ])
  })

  it('keeps a pinned page when the recents list overflows its cap', () => {
    for (let i = 0; i < 24; i++) {
      pushRecentPage({ title: `Page ${i}`, href: `/pages/${i}` })
    }
    pinRecentPage('/pages/2', true)
    // Push more pages so the cap is hit hard.
    for (let i = 100; i < 130; i++) {
      pushRecentPage({ title: `Late ${i}`, href: `/late/${i}` })
    }
    const tabs = readTabs()
    expect(tabs.some((p) => p.href === '/pages/2')).toBe(true)
    expect(tabs.length).toBeLessThanOrEqual(20)
  })
})

describe('saveRecentPages / removeRecentPage', () => {
  it('saveRecentPages drops the pinned home tab and canonicalizes', () => {
    saveRecentPages([
      DEFAULT_TAB,
      { title: 'Freight', href: '/transactions/freight/' },
    ])
    expect(stored()).toEqual([
      { title: 'Freight', href: '/transactions/freight', pinned: false },
    ])
  })

  it('saveRecentPages preserves the pinned flag', () => {
    saveRecentPages([
      DEFAULT_TAB,
      { title: 'Freight', href: '/transactions/freight', pinned: true },
    ])
    expect(stored()).toEqual([
      { title: 'Freight', href: '/transactions/freight', pinned: true },
    ])
  })

  it('removeRecentPage removes a page by any of its aliases', () => {
    pushRecentPage({ title: 'Freight', href: '/transactions/freight' })
    removeRecentPage('/transactions/freight/')
    expect(stored()).toEqual([])
  })
})

describe('tabHrefForPath', () => {
  const open = [
    DEFAULT_TAB.href,
    '/transactions/vouchers/delivery_note',
    '/transactions/vouchers/receipt_note',
    '/reports/day_book',
    '/reports/day_book/self',
  ]

  it('matches an exact path to its own tab', () => {
    expect(tabHrefForPath(open, '/transactions/vouchers/delivery_note')).toBe(
      '/transactions/vouchers/delivery_note',
    )
  })

  it('keeps a nested record URL on its section tab', () => {
    expect(
      tabHrefForPath(open, '/transactions/vouchers/delivery_note/7045'),
    ).toBe('/transactions/vouchers/delivery_note')
  })

  it('picks the deepest section tab when several routes cover the path', () => {
    expect(tabHrefForPath(open, '/reports/day_book/self')).toBe(
      '/reports/day_book/self',
    )
    expect(tabHrefForPath(open, '/reports/day_book/self/123')).toBe(
      '/reports/day_book/self',
    )
  })

  it('recognizes the home page under its / alias', () => {
    expect(tabHrefForPath(open, '/')).toBe('/dashboard')
    expect(tabHrefForPath(open, '/dashboard/')).toBe('/dashboard')
  })

  it('returns null when no open tab covers the path', () => {
    expect(tabHrefForPath(open, '/administration/Menu')).toBeNull()
    expect(tabHrefForPath(open, '/sign-in')).toBeNull()
  })
})
