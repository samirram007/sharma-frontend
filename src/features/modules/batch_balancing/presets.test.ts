import { beforeEach, describe, expect, it } from 'vitest'
import {
  EMPTY_FILTERS,
  PRESET_STORAGE_KEY,
  activeFilterCount,
  normaliseFilters,
  readPresets,
  removePreset,
  savePreset,
} from './presets'

// jsdom doesn't provide window.localStorage in this environment — install a
// faithful in-memory Storage mock (same as src/layouts/lib/recent-pages.test.ts).
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

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  })
})

describe('normaliseFilters', () => {
  it('falls back to the empty filter state for junk input', () => {
    expect(normaliseFilters(null)).toEqual(EMPTY_FILTERS)
    expect(normaliseFilters('nonsense')).toEqual(EMPTY_FILTERS)
    expect(normaliseFilters({})).toEqual(EMPTY_FILTERS)
  })

  it('keeps valid values and repairs invalid ones', () => {
    const filters = normaliseFilters({
      search: '  ULTRATECH  ',
      itemId: 42,
      godownId: 'all',
      batchNo: 7,
      voucherTypeId: '3',
      inStockOnly: true,
      issue: 'negative',
    })

    // Numbers are accepted for id fields (older presets stored numbers).
    expect(filters.itemId).toBe('42')
    expect(filters.voucherTypeId).toBe('3')
    expect(filters.godownId).toBe('all')
    // Non-string / non-number batch numbers are dropped, not coerced.
    expect(filters.batchNo).toBe('')
    expect(filters.inStockOnly).toBe(true)
    expect(filters.issue).toBe('negative')

    // Unknown enum values fall back to 'all'.
    expect(normaliseFilters({ issue: 'whatever' })).toEqual(EMPTY_FILTERS)
    // Only a literal `true` enables the boolean flag.
    expect(normaliseFilters({ inStockOnly: 'yes' }).inStockOnly).toBe(false)
  })
})

describe('activeFilterCount', () => {
  it('counts every non-default filter', () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0)
    expect(
      activeFilterCount({
        ...EMPTY_FILTERS,
        search: '  ',
        itemId: '4',
        inStockOnly: true,
        issue: 'ok',
        batchNo: ' B1 ',
      }),
    ).toBe(4)
  })
})

describe('presets store', () => {
  it('saves, overwrites, lists newest-first and removes presets', () => {
    expect(readPresets()).toEqual([])

    const first = savePreset('Ultratech batches', {
      ...EMPTY_FILTERS,
      search: 'ULTRATECH',
    })
    expect(first).toHaveLength(1)
    expect(first[0].name).toBe('Ultratech batches')
    expect(first[0].filters.search).toBe('ULTRATECH')

    const second = savePreset('Negative batches', {
      ...EMPTY_FILTERS,
      issue: 'negative',
    })
    expect(second.map((p) => p.name)).toEqual([
      'Negative batches',
      'Ultratech batches',
    ])
    expect(readPresets()).toHaveLength(2)

    // Saving the same name replaces it instead of duplicating.
    const replaced = savePreset('Ultratech batches', {
      ...EMPTY_FILTERS,
      search: 'AMBUJA',
    })
    expect(replaced).toHaveLength(2)
    expect(replaced[0].filters.search).toBe('AMBUJA')

    expect(removePreset('Ultratech batches').map((p) => p.name)).toEqual([
      'Negative batches',
    ])
  })

  it('ignores blank names and survives corrupted storage', () => {
    expect(savePreset('   ', EMPTY_FILTERS)).toEqual([])

    localStorage.setItem(PRESET_STORAGE_KEY, 'not json')
    expect(readPresets()).toEqual([])

    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify([{ nope: 1 }, 5]))
    expect(readPresets()).toEqual([])

    // A preset with junk filters still reads back as a usable filter state.
    localStorage.setItem(
      PRESET_STORAGE_KEY,
      JSON.stringify([{ name: 'Junk', filters: { issue: 'nope' } }]),
    )
    expect(readPresets()).toEqual([
      { name: 'Junk', filters: EMPTY_FILTERS, savedAt: '' },
    ])
  })
})
