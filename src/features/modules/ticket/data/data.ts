export const ticketStatusTypes = new Map<string, string>([
  ['open', 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'],
  [
    'in_progress',
    'bg-yellow-100/30 text-yellow-900 dark:text-yellow-200 border-yellow-200',
  ],
  [
    'resolved',
    'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200',
  ],
  ['closed', 'bg-neutral-300/40 border-neutral-300'],
])

export const ticketPriorityTypes = new Map<string, string>([
  [
    'low',
    'bg-slate-100/30 text-slate-900 dark:text-slate-200 border-slate-200',
  ],
  ['medium', 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'],
  [
    'high',
    'bg-orange-100/30 text-orange-900 dark:text-orange-200 border-orange-200',
  ],
  ['urgent', 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200'],
])

export const ticketStatuses = ['open', 'in_progress', 'resolved', 'closed']
export const ticketPriorities = ['low', 'medium', 'high', 'urgent']
export const ticketCategories = [
  'general',
  'bug',
  'feature_request',
  'reports',
  'transactions',
  'inventory',
  'administration',
]
