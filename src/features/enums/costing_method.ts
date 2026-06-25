import { z } from 'zod';

export const CostingMethodSchema = z.union([
    z.literal('at_zero_cost'),
    z.literal('avg_cost'),
    z.literal('fifo'),
    z.literal('fifo_perpetual'),
    z.literal('last_purchase_cost'),
    z.literal('lifo_annual'),
    z.literal('lifo_perpetual'),
    z.literal('monthly_average_cost'),
    z.literal('std_cost'),
])
export type CostingMethod = z.infer<typeof CostingMethodSchema>


export const CostingMethodColorsSchema = new Map<CostingMethod, string>([
    ['at_zero_cost', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
    ['avg_cost', 'bg-neutral-300/40 border-neutral-300'],
    ['fifo', 'bg-neutral-300/40 border-neutral-300'],
    ['fifo_perpetual', 'bg-neutral-300/40 border-neutral-300'],
    ['last_purchase_cost', 'bg-neutral-300/40 border-neutral-300'],
    ['lifo_annual', 'bg-neutral-300/40 border-neutral-300'],
    ['lifo_perpetual', 'bg-neutral-300/40 border-neutral-300'],
    ['monthly_average_cost', 'bg-neutral-300/40 border-neutral-300'],
    ['std_cost', 'bg-neutral-300/40 border-neutral-300'],
])
export const CostingMethodLabelSchema = new Map<CostingMethod, string>([
    ['at_zero_cost', 'At Zero Cost'],
    ['avg_cost', 'Avg. Cost'],
    ['fifo', 'FIFO'],
    ['fifo_perpetual', 'FIFO Perpetual'],
    ['last_purchase_cost', 'Last Purchase Cost'],
    ['lifo_annual', 'LIFO Annual'],
    ['lifo_perpetual', 'LIFO Perpetual'],
    ['monthly_average_cost', 'Monthly Average Cost'],
    ['std_cost', 'Standard Cost'],
])



