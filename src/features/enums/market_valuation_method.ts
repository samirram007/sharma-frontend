import { z } from 'zod';

export const MarketValuationMethodSchema = z.union([
    z.literal('at_zero_price'),
    z.literal('avg_price'),
    z.literal('last_sale_price'),
    z.literal('std_price'),
])
export type MarketValuationMethod = z.infer<typeof MarketValuationMethodSchema>


export const MarketValuationMethodColorsSchema = new Map<MarketValuationMethod, string>([
    ['at_zero_price', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
    ['avg_price', 'bg-neutral-300/40 border-neutral-300'],
    ['last_sale_price', 'bg-neutral-300/40 border-neutral-300'],
    ['std_price', 'bg-neutral-300/40 border-neutral-300'],
])
export const MarketValuationMethodLabelSchema = new Map<MarketValuationMethod, string>([
    ['at_zero_price', 'At Zero Cost'],
    ['avg_price', 'Avg. Price'],
    ['last_sale_price', 'Last Sale Price'],
    ['std_price', 'Std. Price'],
])

