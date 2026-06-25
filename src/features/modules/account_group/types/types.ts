import { z } from 'zod';
import type { formSchema } from "../data/schema";
export type AccountGroupForm = z.infer<typeof formSchema>