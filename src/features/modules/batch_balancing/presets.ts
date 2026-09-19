import type { BatchIssueFilter } from './data/api'

/** The filter fields the report can persist / restore as a preset. */
export interface BatchFilterState {
  search: string
  /** 'all' or the id as a string (the sheet selects work on strings). */
  itemId: string
  godownId: string
  batchNo: string
  voucherTypeId: string
  inStockOnly: boolean
  issue: BatchIssueFilter
}

export const EMPTY_FILTERS: BatchFilterState = {
  search: '',
  itemId: 'all',
  godownId: 'all',
  batchNo: '',
  voucherTypeId: 'all',
  inStockOnly: false,
  issue: 'all',
}

export interface FilterPreset {
  name: string
  filters: BatchFilterState
  /** ISO timestamp, newest presets first in the menu. */
  savedAt: string
}

export const PRESET_STORAGE_KEY = 'batch-balancing-presets-v1'
const MAX_PRESETS = 20

const ISSUE_VALUES: BatchIssueFilter[] = [
  'all',
  'ok',
  'carry_forward',
  'journal_variance',
  'negative',
  'no_movement',
]

function asText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

/** Id selects are stored as strings; anything unusable falls back to 'all'. */
function asId(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'string' && value !== '' && value !== 'all')
    return value
  return 'all'
}

/**
 * Coerces anything (older presets, hand-edited storage, junk) into a usable
 * filter state — a corrupt preset must never break the report.
 */
export function normaliseFilters(value: unknown): BatchFilterState {
  const raw = (value ?? {}) as Record<string, unknown>

  return {
    search: asText(raw.search),
    itemId: asId(raw.itemId),
    godownId: asId(raw.godownId),
    batchNo: asText(raw.batchNo),
    voucherTypeId: asId(raw.voucherTypeId),
    inStockOnly: raw.inStockOnly === true,
    issue: ISSUE_VALUES.includes(raw.issue as BatchIssueFilter)
      ? (raw.issue as BatchIssueFilter)
      : 'all',
  }
}

/** Number of preset-worthy filters currently set (drives the menu badge). */
export function activeFilterCount(filters: BatchFilterState): number {
  let count = 0
  if (filters.search.trim()) count += 1
  if (filters.batchNo.trim()) count += 1
  if (filters.itemId !== 'all') count += 1
  if (filters.godownId !== 'all') count += 1
  if (filters.voucherTypeId !== 'all') count += 1
  if (filters.inStockOnly) count += 1
  if (filters.issue !== 'all') count += 1
  return count
}

/** Saved presets, newest first. Never throws — storage may be unavailable. */
export function readPresets(): FilterPreset[] {
  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(
        (entry): entry is Record<string, unknown> =>
          !!entry && typeof entry === 'object',
      )
      .map((entry) => ({
        name: asText(entry.name),
        filters: normaliseFilters(entry.filters),
        savedAt: asText(entry.savedAt),
      }))
      .filter((preset) => preset.name !== '')
  } catch {
    return []
  }
}

function writePresets(presets: FilterPreset[]): void {
  try {
    localStorage.setItem(
      PRESET_STORAGE_KEY,
      JSON.stringify(presets.slice(0, MAX_PRESETS)),
    )
  } catch {
    // storage unavailable (private mode etc.) — presets simply don't persist
  }
}

/** Save (or overwrite) a named preset and return the new list. */
export function savePreset(
  name: string,
  filters: BatchFilterState,
): FilterPreset[] {
  const trimmed = name.trim()
  if (!trimmed) return readPresets()

  const preset: FilterPreset = {
    name: trimmed,
    filters: normaliseFilters(filters),
    savedAt: new Date().toISOString(),
  }
  const next = [
    preset,
    ...readPresets().filter((entry) => entry.name !== trimmed),
  ]
  writePresets(next)
  return next
}

/** Delete a preset by name and return the new list. */
export function removePreset(name: string): FilterPreset[] {
  const next = readPresets().filter((entry) => entry.name !== name)
  writePresets(next)
  return next
}
