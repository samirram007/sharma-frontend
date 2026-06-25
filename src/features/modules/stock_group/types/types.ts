import { z } from 'zod';
import type { formSchema } from "../data/schema";
export type StockGroupForm = z.infer<typeof formSchema>