import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  appearance,
  useAppearance,
  useAvatarUrl,
  useWallpaper,
} from './appearance-store'

// jsdom doesn't provide window.localStorage in this environment — install a
// faithful in-memory Storage mock (same approach as token-storage.test.ts).
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

Object.defineProperty(window, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
  writable: true,
})

beforeEach(() => {
  window.localStorage.clear()
  // Reset the module-level store between tests.
  act(() => {
    appearance.setAvatar(null)
    appearance.setWallpaper(null)
    appearance.setWallpaperDim(0.55)
    appearance.setWallpaperColor(null)
    appearance.setWallpaperOpacity(1)
  })
})

describe('appearance store', () => {
  it('starts with defaults', () => {
    const { result } = renderHook(() => useAppearance())
    expect(result.current).toEqual({
      avatarUrl: null,
      wallpaperUrl: null,
      wallpaperDim: 0.55,
      wallpaperColor: null,
      wallpaperOpacity: 1,
    })
  })

  it('setAvatar notifies subscribers and persists to localStorage', () => {
    const { result } = renderHook(() => useAvatarUrl())

    act(() => appearance.setAvatar('/api/document-manager/nodes/9/preview'))

    expect(result.current).toBe('/api/document-manager/nodes/9/preview')
    expect(
      JSON.parse(window.localStorage.getItem('aipt-appearance-v1') ?? '{}')
        .avatarUrl,
    ).toBe('/api/document-manager/nodes/9/preview')
  })

  it('clearing the wallpaper returns url to null', () => {
    const { result } = renderHook(() => useWallpaper())

    act(() => appearance.setWallpaper('/api/document-manager/nodes/4/preview'))
    expect(result.current.url).toBe('/api/document-manager/nodes/4/preview')

    act(() => appearance.setWallpaper(null))
    expect(result.current.url).toBeNull()
  })

  it('clamps the wallpaper dim to 0–0.8', () => {
    const { result } = renderHook(() => useAppearance())

    act(() => appearance.setWallpaperDim(42))
    expect(result.current.wallpaperDim).toBe(0.8)

    act(() => appearance.setWallpaperDim(-3))
    expect(result.current.wallpaperDim).toBe(0)
  })

  it('setWallpaperColor stores and clears the backdrop color', () => {
    const { result } = renderHook(() => useWallpaper())

    act(() => appearance.setWallpaperColor('#1e293b'))
    expect(result.current.color).toBe('#1e293b')

    act(() => appearance.setWallpaperColor(null))
    expect(result.current.color).toBeNull()
  })

  it('setWallpaperOpacity stores and clamps to 0.05–1', () => {
    const { result } = renderHook(() => useWallpaper())

    act(() => appearance.setWallpaperOpacity(0.4))
    expect(result.current.opacity).toBe(0.4)

    act(() => appearance.setWallpaperOpacity(5))
    expect(result.current.opacity).toBe(1)

    act(() => appearance.setWallpaperOpacity(0))
    expect(result.current.opacity).toBe(0.05)
  })

  it('falls back to defaults when stored JSON is corrupted', () => {
    window.localStorage.setItem('aipt-appearance-v1', '{not json')
    vi.resetModules()
    // Re-import fresh so readStored() runs against the corrupted value.
    return import('./appearance-store').then((fresh) => {
      const { result } = renderHook(() => fresh.useAppearance())
      expect(result.current).toEqual({
        avatarUrl: null,
        wallpaperUrl: null,
        wallpaperDim: 0.55,
        wallpaperColor: null,
        wallpaperOpacity: 1,
      })
    })
  })
})
