import type { z } from 'zod'
import type { formSchema } from "../data/schema"

export type MenuForm = z.infer<typeof formSchema>
