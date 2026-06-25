import { z } from 'zod';

export const ActiveInactiveStatusSchema = z.union([
    z.literal('active'),
    z.literal('inactive'),])
export type ActiveInactiveStatus = z.infer<typeof ActiveInactiveStatusSchema>


export const ActiveInactiveStatusTypes = new Map<ActiveInactiveStatus, string>([
    ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
    ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])
