export interface NatureBadge {
  label: string
  className: string
}

// Maps account nature codes (seeder uses AST/LIA/EQY) to badge label + color.
// Also accepts the legacy full-word codes (ASSET/LIABILITY/EQUITY) defensively.
const NATURE_BADGE_MAP: Record<string, NatureBadge> = {
  AST: {
    label: 'Asset',
    className: 'border-blue-300 text-blue-700 dark:text-blue-400',
  },
  ASSET: {
    label: 'Asset',
    className: 'border-blue-300 text-blue-700 dark:text-blue-400',
  },
  LIA: {
    label: 'Liability',
    className: 'border-amber-300 text-amber-700 dark:text-amber-400',
  },
  LIABILITY: {
    label: 'Liability',
    className: 'border-amber-300 text-amber-700 dark:text-amber-400',
  },
  EQY: {
    label: 'Equity',
    className: 'border-green-300 text-green-700 dark:text-green-400',
  },
  EQUITY: {
    label: 'Equity',
    className: 'border-green-300 text-green-700 dark:text-green-400',
  },
  INC: {
    label: 'Income',
    className: 'border-green-300 text-green-700 dark:text-green-400',
  },
  EXP: {
    label: 'Expenses',
    className: 'border-green-300 text-green-700 dark:text-green-400',
  },
}

const DEFAULT_BADGE: NatureBadge = {
  label: '—',
  className: 'border-green-300 text-green-700 dark:text-green-400',
}

export function getNatureBadge(code: string | null | undefined): NatureBadge {
  if (!code) return DEFAULT_BADGE
  return NATURE_BADGE_MAP[code] ?? DEFAULT_BADGE
}
