import type { accountLedgerStatus } from './schema';

export const accountLedgerStatusTypes = new Map<accountLedgerStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])


