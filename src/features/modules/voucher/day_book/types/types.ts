import type { z } from 'zod'
import type { formSchema } from '../data/schema'
export type DayBookForm = z.infer<typeof formSchema>

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResponse<T> {
  status: boolean
  code: number
  message: string
  data: T[]
  meta: PaginationMeta
  links?: {
    first?: string
    last?: string
    prev?: string | null
    next?: string | null
  }
}
