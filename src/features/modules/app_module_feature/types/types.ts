import { z } from 'zod';
import type { formSchema } from "../data/schema";
export type AppModuleFeatureForm = z.infer<typeof formSchema>