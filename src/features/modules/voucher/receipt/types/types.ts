import { z } from 'zod';
import type { formSchema } from "../data/schema";
export type ReceiptForm = z.infer<typeof formSchema>