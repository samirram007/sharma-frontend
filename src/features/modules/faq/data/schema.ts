import { z } from 'zod'

export const faqSchema = z.object({
  id: z.number().int().positive(),
  question: z.string().min(1),
  answer: z.string(),
  category: z.string().nullish(),
  sortOrder: z.number().nullish(),
  isPublished: z.boolean().nullish(),
  userId: z.number().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})

export type Faq = z.infer<typeof faqSchema>
export const faqListSchema = z.array(faqSchema)
export type FaqList = z.infer<typeof faqListSchema>

export const formSchema = z.object({
  question: z.string().min(1, { message: 'Question is required.' }),
  answer: z.string().min(1, { message: 'Answer is required.' }),
  category: z.string().nullish(),
  sortOrder: z.coerce.number().nullish(),
  isPublished: z.boolean().default(true),
  isEdit: z.boolean(),
})

export type FaqForm = z.infer<typeof formSchema>

// Display helper for formatted publish date
export function formatPublishDate(dateString?: string | null): string {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}
