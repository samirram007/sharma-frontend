import type { accountingEffects, accountNatureStatus } from './schema';

export const accountNatureStatusTypes = new Map<accountNatureStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])
export const accountingEffectsTypes = new Map<accountingEffects, string>([
  ['debit', 'bg-teal-400/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['credit', 'bg-yellow-400/30 text-yellow-900 dark:text-yellow-200 border-yellow-300'],
])

