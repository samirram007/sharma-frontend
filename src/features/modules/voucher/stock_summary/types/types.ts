import { z } from 'zod';
import type { formSchema } from "../data/schema";
export type StockSummaryForm = z.infer<typeof formSchema>