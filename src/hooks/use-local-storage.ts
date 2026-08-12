import { useCallback, useEffect, useState, type SetStateAction } from 'react'

/**
 * `useLocalStorage` — persisted state hook.
 *
 * Reads `key` from localStorage on mount (falling back to `defaultValue` when
 * the key is missing or the stored value isn't valid JSON) and writes the
 * value back on every change. Values are JSON-serialized, so any
 * JSON-serializable type works (strings, numbers, booleans, arrays, objects).
 *
 * Usage mirrors `useState`:
 *
 *   const [viewMode, setViewMode] = useLocalStorage<'tabbed' | 'single'>('dispatchViewMode', 'tabbed')
 *
 * Pass `{ raw: true }` for plain-string values (e.g. theme names) that were
 * never JSON-encoded — reads bypass JSON.parse and writes use `String(value)`,
 * so legacy bare-string entries keep working without a one-time reset.
 *
 * Pass `{ deserialize }` to transform or validate the parsed stored value
 * before use (e.g. merge legacy data with the current defaults, or fall back
 * to the default when a stale value is no longer valid). The callback receives
 * `(stored, defaultValue)` so validate-style callbacks never need to close
 * over the default. The transformed value is also what gets written back on
 * mount and on every change, normalizing older entries. If the callback
 * throws, the default is used.
 *
 * If the `key` changes at runtime, the new key's stored value is re-read
 * (falling back to `defaultValue` when empty) instead of reusing the old
 * key's value — the old value is never written into the new key. (Only `key`
 * changes trigger a re-read; changing `defaultValue` or `raw` at runtime is
 * not supported.)
 *
 * Storage errors (private mode, quota, corrupted values) are swallowed and the
 * default is used, so callers never need their own try/catch.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    raw?: boolean
    /**
     * Transform or validate the parsed stored value before use. Receives the
     * default value as the second argument so validate-style callbacks can
     * return it directly. If it throws, the default is used.
     */
    deserialize?: (stored: unknown, defaultValue: T) => T
  },
) {
  const raw = options?.raw ?? false
  const deserialize = options?.deserialize

  const read = (storageKey: string): T => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored === null) return defaultValue
      const parsed = raw ? (stored as unknown as T) : (JSON.parse(stored) as T)
      return deserialize ? deserialize(parsed, defaultValue) : parsed
    } catch {
      // localStorage unavailable, stored value not valid JSON, or the
      // deserialize transform failed — use default
      return defaultValue
    }
  }

  // The key and its value live in the same state slice so a runtime key change
  // re-reads the new key instead of reusing (and clobbering) the old value.
  const [state, setState] = useState(() => ({ key, value: read(key) }))

  // React's documented "adjusting state when a prop changes" pattern: when the
  // key prop changes, synchronously re-read the new key during render — before
  // any effects run — so the persistence effect below can never write the old
  // key's value into the new key.
  if (state.key !== key) {
    setState({ key, value: read(key) })
  }

  const setValue = useCallback((next: SetStateAction<T>) => {
    setState((prev) => ({
      ...prev,
      value:
        typeof next === 'function'
          ? (next as (prevValue: T) => T)(prev.value)
          : next,
    }))
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        key,
        raw ? String(state.value) : JSON.stringify(state.value),
      )
    } catch {
      // silently ignore storage errors (private mode, quota, etc.)
    }
  }, [key, raw, state.value])

  return [state.value, setValue] as const
}
