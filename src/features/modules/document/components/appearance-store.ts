import { useSyncExternalStore } from 'react'

/**
 * Tiny browser-scoped appearance store: profile avatar URL + workspace
 * wallpaper (image URL, tint color, opacity). Persisted to localStorage under
 * one key so "Set as profile image" and "Set as background" from the document
 * manager survive reloads.
 *
 * Using a store + useSyncExternalStore (instead of many useLocalStorage
 * instances) keeps every consumer — header avatar, sidebar, layout
 * background — in sync from one place.
 */
export interface AppearanceState {
  /** URL of the user's chosen profile image (preview endpoint URL). */
  avatarUrl: string | null
  /** URL of the workspace background image (preview endpoint URL). */
  wallpaperUrl: string | null
  /** Dimming overlay opacity for the wallpaper, 0–0.8. */
  wallpaperDim: number
  /** Backdrop color for the workspace background (any CSS color), or null. */
  wallpaperColor: string | null
  /** Overall opacity of the background image layer, 0.05–1. */
  wallpaperOpacity: number
}

/** Visible (non-dimmed) opacity range for the background image layer. */
export const WALLPAPER_OPACITY_MIN = 0.05
export const WALLPAPER_OPACITY_MAX = 1

export function clampWallpaperOpacity(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_STATE.wallpaperOpacity
  return Math.min(WALLPAPER_OPACITY_MAX, Math.max(WALLPAPER_OPACITY_MIN, value))
}

const STORAGE_KEY = 'aipt-appearance-v1'

const DEFAULT_STATE: AppearanceState = {
  avatarUrl: null,
  wallpaperUrl: null,
  wallpaperDim: 0.55,
  wallpaperColor: null,
  wallpaperOpacity: 1,
}

type Listener = () => void

let state: AppearanceState = readStored()
let wallpaperSnapshot = {
  url: state.wallpaperUrl,
  dim: state.wallpaperDim,
  color: state.wallpaperColor,
  opacity: state.wallpaperOpacity,
}
const listeners = new Set<Listener>()

function readStored(): AppearanceState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    const parsed = JSON.parse(raw) as Partial<AppearanceState>
    return {
      avatarUrl: parsed.avatarUrl ?? null,
      wallpaperUrl: parsed.wallpaperUrl ?? null,
      // Guard against corrupted values; keep the wallpaper visible when dim
      // is missing but clamp nonsense like -2 or 99.
      wallpaperDim: Math.min(
        0.8,
        Math.max(
          0,
          typeof parsed.wallpaperDim === 'number'
            ? parsed.wallpaperDim
            : DEFAULT_STATE.wallpaperDim,
        ),
      ),
      wallpaperColor: parsed.wallpaperColor ?? null,
      wallpaperOpacity: clampWallpaperOpacity(
        typeof parsed.wallpaperOpacity === 'number'
          ? parsed.wallpaperOpacity
          : DEFAULT_STATE.wallpaperOpacity,
      ),
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // private mode / quota — in-memory state still works for the session
  }
}

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): AppearanceState {
  return state
}

function setState(patch: Partial<AppearanceState>) {
  state = { ...state, ...patch }
  // Rebuild the cached wallpaper snapshot — useSyncExternalStore compares
  // snapshots by reference, so returning a fresh object per call would loop.
  wallpaperSnapshot = {
    url: state.wallpaperUrl,
    dim: state.wallpaperDim,
    color: state.wallpaperColor,
    opacity: state.wallpaperOpacity,
  }
  persist()
  emit()
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export const appearance = {
  setAvatar(url: string | null) {
    setState({ avatarUrl: url })
  },
  setWallpaper(url: string | null) {
    setState({ wallpaperUrl: url })
  },
  setWallpaperDim(dim: number) {
    setState({ wallpaperDim: Math.min(0.8, Math.max(0, dim)) })
  },
  /** Set/reset the backdrop color behind (and around) the background image. */
  setWallpaperColor(color: string | null) {
    setState({ wallpaperColor: color })
  },
  /** Opacity of the background image layer, clamped to 0.05–1. */
  setWallpaperOpacity(opacity: number) {
    setState({ wallpaperOpacity: clampWallpaperOpacity(opacity) })
  },
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Full appearance state (re-renders on any change). */
export function useAppearance(): AppearanceState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Just the avatar URL (only re-renders when the avatar changes). */
export function useAvatarUrl(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => state.avatarUrl,
    () => state.avatarUrl,
  )
}

/** Wallpaper URL + dim + color + opacity for the layout background. */
export function useWallpaper(): {
  url: string | null
  dim: number
  color: string | null
  opacity: number
} {
  return useSyncExternalStore(
    subscribe,
    () => wallpaperSnapshot,
    () => wallpaperSnapshot,
  )
}
