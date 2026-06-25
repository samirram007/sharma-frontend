import type { ActiveInactiveStatus } from '@/types/active-inactive-status';

export const permissionStatusTypes = new Map<ActiveInactiveStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

