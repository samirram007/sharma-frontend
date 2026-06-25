import { z } from 'zod';
import type { formSchema } from "../data/schema";
export type UniqueQuantityCodeForm = z.infer<typeof formSchema>