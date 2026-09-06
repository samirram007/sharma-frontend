const STORAGE_KEY = 'favorite-shortcuts-v1'

/** Read the user's favorited shortcut routes (hrefs), oldest pick first. */
export function readFavoriteHrefs(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : []
  } catch {
    return []
  }
}

/** Toggle a shortcut in favorites and return the new list. */
export function toggleFavoriteHref(href: string): string[] {
  const current = readFavoriteHrefs()
  const next = current.includes(href)
    ? current.filter((h) => h !== href)
    : [...current, href]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable (private mode etc.) — favorites simply don't persist
  }
  return next
}
