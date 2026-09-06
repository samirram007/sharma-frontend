import { faqQueryOptions } from '../data/queryOptions'
import { useQuery } from '@tanstack/react-query'
import { faqListSchema } from '../data/schema'
import { faqCategoryTypes } from '../data/data'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { IconSearch, IconLoader2 } from '@tabler/icons-react'
import { useState } from 'react'

export default function FaqHelpCenterTab() {
  const { data, isLoading, isError } = useQuery(faqQueryOptions())
  const faqs = faqListSchema.safeParse(data?.data ?? []).success
    ? faqListSchema.parse(data?.data ?? [])
    : []
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredFaqs = faqs.filter((faq) => {
    if (!faq.isPublished) return false
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      !selectedCategory || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    ...new Set(faqs.map((faq) => faq.category).filter(Boolean)),
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <IconLoader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 p-8 text-center dark:border-white/[0.07]">
        <p className="text-sm text-slate-500">
          Unable to load FAQs. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search FAQs..."
          className="w-full rounded-md border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm dark:border-white/[0.07] dark:bg-white/5"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              !selectedCategory
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300',
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat ?? null)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize',
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300',
              )}
            >
              {cat?.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 p-8 text-center dark:border-white/[0.07]">
            <p className="text-sm text-slate-500">No FAQs found.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="rounded-md border border-slate-200/70 bg-white p-4 dark:border-white/[0.07] dark:bg-white/5"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {faq.question}
                </h3>
                {faq.category && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 text-xs',
                      faqCategoryTypes.get(faq.category) ?? '',
                    )}
                  >
                    {faq.category}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {faq.answer}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
