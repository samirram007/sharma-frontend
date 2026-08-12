import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useLocalStorage } from './use-local-storage'

// jsdom doesn't provide window.localStorage in this environment — install a
// faithful in-memory Storage mock so the hook is exercised end-to-end.
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

describe('useLocalStorage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: new MemoryStorage(),
      configurable: true,
      writable: true,
    })
  })

  it('returns the default when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('reads a stored JSON value on mount', () => {
    window.localStorage.setItem('key', JSON.stringify('tabbed'))
    const { result } = renderHook(() => useLocalStorage('key', 'fallback'))
    expect(result.current[0]).toBe('tabbed')
  })

  it('falls back to the default when the stored value is not valid JSON', () => {
    // Legacy code stored bare strings (no JSON quotes); JSON.parse fails → default
    window.localStorage.setItem('key', 'tabbed')
    const { result } = renderHook(() => useLocalStorage('key', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'a'))
    act(() => {
      result.current[1]('b')
    })
    expect(result.current[0]).toBe('b')
    expect(window.localStorage.getItem('key')).toBe(JSON.stringify('b'))
  })

  it('supports boolean values', () => {
    window.localStorage.setItem('key', JSON.stringify(true))
    const { result } = renderHook(() => useLocalStorage('key', false))
    expect(result.current[0]).toBe(true)
  })

  it('raw mode reads a bare string without JSON parsing', () => {
    // Legacy theme/font values were stored without JSON quotes
    window.localStorage.setItem('key', 'dark')
    const { result } = renderHook(() =>
      useLocalStorage('key', 'light', { raw: true }),
    )
    expect(result.current[0]).toBe('dark')
  })

  it('raw mode persists updates as bare strings', () => {
    const { result } = renderHook(() =>
      useLocalStorage('key', 'light', { raw: true }),
    )
    act(() => {
      result.current[1]('system')
    })
    expect(result.current[0]).toBe('system')
    expect(window.localStorage.getItem('key')).toBe('system')
  })

  it('raw mode falls back to the default when nothing is stored', () => {
    const { result } = renderHook(() =>
      useLocalStorage('key', 'light', { raw: true }),
    )
    expect(result.current[0]).toBe('light')
  })

  it('re-reads the new key when the key changes at runtime', () => {
    window.localStorage.setItem('key-a', JSON.stringify('from-a'))
    window.localStorage.setItem('key-b', JSON.stringify('from-b'))
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, 'fallback'),
      { initialProps: { key: 'key-a' } },
    )
    expect(result.current[0]).toBe('from-a')

    rerender({ key: 'key-b' })

    expect(result.current[0]).toBe('from-b')
    // The new key must never be clobbered with the old key's value.
    expect(window.localStorage.getItem('key-b')).toBe(JSON.stringify('from-b'))
  })

  it('falls back to the default when the new key has no stored value', () => {
    window.localStorage.setItem('key-a', JSON.stringify('from-a'))
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, 'fallback'),
      { initialProps: { key: 'key-a' } },
    )

    rerender({ key: 'key-b' })

    expect(result.current[0]).toBe('fallback')
  })

  it('persists updates to the newly-selected key after a key change', () => {
    window.localStorage.setItem('key-a', JSON.stringify('from-a'))
    window.localStorage.setItem('key-b', JSON.stringify('from-b'))
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, 'fallback'),
      { initialProps: { key: 'key-a' } },
    )
    rerender({ key: 'key-b' })

    act(() => {
      result.current[1]('updated-b')
    })

    expect(window.localStorage.getItem('key-a')).toBe(JSON.stringify('from-a'))
    expect(window.localStorage.getItem('key-b')).toBe(
      JSON.stringify('updated-b'),
    )
  })

  it('applies a deserialize transform to the stored value', () => {
    // Stored config is missing the 'b' key (e.g. a newly added section)
    window.localStorage.setItem(
      'key',
      JSON.stringify([{ key: 'a', value: false }]),
    )
    const defaults = [
      { key: 'a', value: true },
      { key: 'b', value: true },
    ]
    const merge = (stored: unknown) =>
      defaults.map(
        (def) =>
          (stored as Array<{ key: string; value: boolean }>).find(
            (p) => p.key === def.key,
          ) ?? def,
      )
    const { result } = renderHook(() =>
      useLocalStorage('key', defaults, { deserialize: merge }),
    )
    // Stored 'a'=false wins; missing 'b' falls back to its default.
    expect(result.current[0]).toEqual([
      { key: 'a', value: false },
      { key: 'b', value: true },
    ])
  })

  it('normalizes storage by persisting the deserialized value', () => {
    window.localStorage.setItem(
      'key',
      JSON.stringify([{ key: 'a', value: false }]),
    )
    const defaults = [
      { key: 'a', value: true },
      { key: 'b', value: true },
    ]
    const merge = (stored: unknown) =>
      defaults.map(
        (def) =>
          (stored as Array<{ key: string; value: boolean }>).find(
            (p) => p.key === def.key,
          ) ?? def,
      )
    renderHook(() => useLocalStorage('key', defaults, { deserialize: merge }))
    // The missing default key is written back on mount.
    expect(window.localStorage.getItem('key')).toBe(
      JSON.stringify([
        { key: 'a', value: false },
        { key: 'b', value: true },
      ]),
    )
  })

  it('falls back to the default when deserialize throws', () => {
    window.localStorage.setItem('key', JSON.stringify([{ key: 'a' }]))
    const defaults = [{ key: 'a', value: true }]
    const boom = () => {
      throw new Error('bad stored shape')
    }
    const { result } = renderHook(() =>
      useLocalStorage('key', defaults, { deserialize: boom }),
    )
    expect(result.current[0]).toEqual(defaults)
  })

  it('supports validate-style deserialize using the passed default', () => {
    // An outdated font name stored as a bare string (raw mode)
    window.localStorage.setItem('key', 'comic-sans')
    const validFonts = ['poppins', 'inter']
    const validate = (stored: unknown, fallback: string) =>
      (validFonts as string[]).includes(stored as string)
        ? (stored as string)
        : fallback

    const { result } = renderHook(() =>
      useLocalStorage('key', 'poppins', { raw: true, deserialize: validate }),
    )

    expect(result.current[0]).toBe('poppins')
  })

  it('keeps a valid value through validate-style deserialize', () => {
    window.localStorage.setItem('key', 'inter')
    const validFonts = ['poppins', 'inter']
    const validate = (stored: unknown, fallback: string) =>
      (validFonts as string[]).includes(stored as string)
        ? (stored as string)
        : fallback

    const { result } = renderHook(() =>
      useLocalStorage('key', 'poppins', { raw: true, deserialize: validate }),
    )

    expect(result.current[0]).toBe('inter')
  })

  it('normalizes an invalid stored value back to the default', () => {
    window.localStorage.setItem('key', 'comic-sans')
    const validFonts = ['poppins', 'inter']
    const validate = (stored: unknown, fallback: string) =>
      (validFonts as string[]).includes(stored as string)
        ? (stored as string)
        : fallback

    renderHook(() =>
      useLocalStorage('key', 'poppins', { raw: true, deserialize: validate }),
    )

    // The default is written back over the invalid stored value on mount.
    expect(window.localStorage.getItem('key')).toBe('poppins')
  })
})
