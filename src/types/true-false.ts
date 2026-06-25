import { z } from 'zod';

export const TrueFalseSchema = z.union([
    z.literal(true),
    z.literal(false),
])
export type TrueFalse = z.infer<typeof TrueFalseSchema>


export const TrueFalseStatusTypes = new Map<TrueFalse, string>([
    [true, 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
    [false, 'bg-neutral-300/40 border-neutral-300'],
])
