import { z } from 'zod';
import type { formSchema } from "../data/schema";
export type AppModuleForm = z.infer<typeof formSchema>