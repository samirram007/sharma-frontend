import { z } from 'zod';
import type { formSchema } from "../data/schema";
export type EmployeeGroupForm = z.infer<typeof formSchema>